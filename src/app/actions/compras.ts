'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getPurchases() {
    return await prisma.rawMaterialPurchase.findMany({
        include: {
            supplier: true,
            material: true
        },
        orderBy: { date: 'desc' }
    });
}

export async function getSuppliers() {
    return await prisma.supplier.findMany();
}

export async function getRawMaterials() {
    return await prisma.rawMaterial.findMany();
}

export async function createPurchase(formData: {
    date: Date;
    supplierId: string;
    materialId: string;
    invoiceNumber: string;
    quantity: number;
    unitPrice: number;
}) {
    const { date, supplierId, materialId, invoiceNumber, quantity, unitPrice } = formData;
    const totalPrice = quantity * unitPrice;

    if (quantity <= 0 || unitPrice < 0) {
        throw new Error("La cantidad debe ser mayor a 0 y el precio válido.");
    }

    // Obtenemos el material actual para recalcular precio medio (PMP)
    const currentMaterial = await prisma.rawMaterial.findUnique({
        where: { id: materialId }
    });

    if (!currentMaterial) throw new Error("Materia prima no encontrada");

    // Coste Medio Ponderado (CMP)
    const currentTotalValue = currentMaterial.currentStock * currentMaterial.averageUnitPrice;
    const newPurchaseValue = quantity * unitPrice;
    const newTotalStock = currentMaterial.currentStock + quantity;

    const newAveragePrice = newTotalStock > 0 ? (currentTotalValue + newPurchaseValue) / newTotalStock : unitPrice;

    // Transacción ACID
    const purchase = await prisma.$transaction(async (tx) => {
        // 1. Guardar la compra
        const createdPurchase = await tx.rawMaterialPurchase.create({
            data: {
                date,
                supplierId,
                materialId,
                invoiceNumber,
                quantity,
                unitPrice,
                totalPrice
            }
        });

        // 2. Incrementar stock y actualizar CMP
        await tx.rawMaterial.update({
            where: { id: materialId },
            data: {
                currentStock: newTotalStock,
                averageUnitPrice: newAveragePrice
            }
        });

        return createdPurchase;
    });

    revalidatePath('/compras');
    return purchase;
}
