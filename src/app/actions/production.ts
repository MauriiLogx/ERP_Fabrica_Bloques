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
        where: { isActive: true }
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

    const blockType = await prisma.blockType.findUnique({
        where: { id: blockTypeId }
    });

    if (!blockType) {
        throw new Error("No se encontró este tipo de bloque.");
    }

    // Generamos un código de lote único (LOTE-YYYYMMDD-Rand)
    const code = `LOTE-${date.toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const batch = await prisma.$transaction(async (tx) => {
        // 1. Crear el lote simplificado
        const newBatch = await tx.productionBatch.create({
            data: {
                code,
                date,
                shift,
                blockTypeId,
                totalBlocksProduced: totalBlocks,
                createdById,
                batchWorkers: {
                    create: workers.map(w => ({
                        workerId: w.workerId,
                        blocksProduced: w.blocksProduced
                    }))
                }
            }
        });

        // 2. Actualizar stock en patio
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

        // 3. Generar movimiento de stock
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
