'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getProductionBatches() {
    return await prisma.productionBatch.findMany({
        include: {
            blockType: true,
            createdBy: true,
            batchWorkers: {
                include: {
                    worker: true
                }
            }
        },
        orderBy: { date: 'desc' }
    });
}

export async function getBlockTypes() {
    return await prisma.blockType.findMany({
        where: { isActive: true },
        include: { formulation: true }
    });
}

export async function getWorkers() {
    return await prisma.worker.findMany({
        where: { isActive: true }
    });
}

export async function createProductionBatch(formData: {
    date: Date;
    shift: string;
    blockTypeId: string;
    createdById: string;
    workers: { workerId: string; blocksProduced: number }[];
}) {
    const { date, shift, blockTypeId, createdById, workers } = formData;

    const totalBlocks = workers.reduce((acc, w) => acc + w.blocksProduced, 0);

    if (totalBlocks <= 0) {
        throw new Error("La producción debe ser mayor a 0 bloques.");
    }

    // Obtenemos la fórmula
    const blockType = await prisma.blockType.findUnique({
        where: { id: blockTypeId },
        include: { formulation: true }
    });

    if (!blockType || !blockType.formulation) {
        throw new Error("No se encontró la fórmula para este tipo de bloque.");
    }

    const formulation = blockType.formulation;

    // Calculamos consumo
    const totalCementNeeded = formulation.cementKgPerBlock * totalBlocks;
    const totalSandNeeded = formulation.sandKgPerBlock * totalBlocks;
    const totalAdditiveNeeded = formulation.additiveKgPerBlock * totalBlocks;

    // Obtenemos las materias primas desde la base de datos
    // Para el MVP buscamos por nombres que ingresamos en seed.ts
    const rawMaterials = await prisma.rawMaterial.findMany();

    const cemento = rawMaterials.find(rm => rm.name.includes('Cemento'));
    const arena = rawMaterials.find(rm => rm.name.includes('Arena'));
    const aditivo = rawMaterials.find(rm => rm.name.includes('Aditivo'));

    if (!cemento || !arena || !aditivo) {
        throw new Error("Faltan materias primas maestras en la BD.");
    }

    if (cemento.currentStock < totalCementNeeded) throw new Error("Stock insuficiente de Cemento.");
    if (arena.currentStock < totalSandNeeded) throw new Error("Stock insuficiente de Arena.");
    if (aditivo.currentStock < totalAdditiveNeeded) throw new Error("Stock insuficiente de Aditivo.");

    // Calculamos Costes
    const costCement = totalCementNeeded * cemento.averageUnitPrice;
    const costSand = totalSandNeeded * arena.averageUnitPrice;
    const costAdditive = totalAdditiveNeeded * aditivo.averageUnitPrice;

    const totalCost = costCement + costSand + costAdditive;
    const unitCostPerBlock = totalCost / totalBlocks;

    // Generamos un código de lote único (LOTE-YYYYMMDD-Rand)
    const code = `LOTE-${date.toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Ejecutamos todo dentro de una transacción ACID
    const batch = await prisma.$transaction(async (tx) => {
        // 1. Crear el lote
        const newBatch = await tx.productionBatch.create({
            data: {
                code,
                date,
                shift,
                blockTypeId,
                totalBlocksProduced: totalBlocks,
                costCement,
                costSand,
                costAdditive,
                totalCost,
                unitCostPerBlock,
                createdById,
                batchWorkers: {
                    create: workers.map(w => ({
                        workerId: w.workerId,
                        blocksProduced: w.blocksProduced
                    }))
                }
            }
        });

        // 2. Descontar materias primas
        await tx.rawMaterial.update({
            where: { id: cemento.id },
            data: { currentStock: { decrement: totalCementNeeded } }
        });
        await tx.rawMaterial.update({
            where: { id: arena.id },
            data: { currentStock: { decrement: totalSandNeeded } }
        });
        await tx.rawMaterial.update({
            where: { id: aditivo.id },
            data: { currentStock: { decrement: totalAdditiveNeeded } }
        });

        // 3. Actualizar stock en patio
        await tx.yardStock.upsert({
            where: { blockTypeId },
            create: {
                blockTypeId,
                currentQuantity: totalBlocks
            },
            update: {
                currentQuantity: { increment: totalBlocks }
            }
        });

        // 4. Generar movimiento de stock
        await tx.stockMovement.create({
            data: {
                blockTypeId,
                type: 'IN_PRODUCTION',
                quantity: totalBlocks,
                date,
                referenceId: newBatch.id
            }
        });

        return newBatch;
    });

    revalidatePath('/produccion');
    return batch;
}
