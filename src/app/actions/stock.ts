'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getYardStock() {
    return await prisma.yardStock.findMany({
        include: {
            blockType: true
        },
        orderBy: {
            blockType: {
                name: 'asc'
            }
        }
    });
}

export async function getStockMovements() {
    return await prisma.stockMovement.findMany({
        include: {
            blockType: true
        },
        orderBy: {
            date: 'desc'
        },
        take: 100 // Limit for the MVP view
    });
}

export async function adjustYardStock(formData: {
    blockTypeId: string;
    quantityDiff: number; // Positive for addition, negative for subtraction
    reason: string;
}) {
    const { blockTypeId, quantityDiff, reason } = formData;

    if (quantityDiff === 0) throw new Error("La diferencia de ajuste no puede ser 0.");

    const currentStock = await prisma.yardStock.findUnique({
        where: { blockTypeId }
    });

    if (currentStock && currentStock.currentQuantity + quantityDiff < 0) {
        throw new Error("El ajuste dejaría el stock en negativo.");
    }

    const result = await prisma.$transaction(async (tx) => {
        // 1. Update stock
        const newStock = await tx.yardStock.upsert({
            where: { blockTypeId },
            create: {
                blockTypeId,
                currentQuantity: quantityDiff > 0 ? quantityDiff : 0
            },
            update: {
                currentQuantity: { increment: quantityDiff }
            }
        });

        // 2. Log movement
        await tx.stockMovement.create({
            data: {
                blockTypeId,
                type: 'ADJUSTMENT',
                quantity: quantityDiff,
                date: new Date(),
                referenceId: `ADJ-${Date.now()}-${reason.substring(0, 10)}`
            }
        });

        return newStock;
    });

    revalidatePath('/stock');
    return result;
}
