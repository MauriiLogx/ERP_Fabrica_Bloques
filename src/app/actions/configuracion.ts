'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getBlockTypes() {
    return await prisma.blockType.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function createBlockType(formData: {
    name: string;
    dimensions: string;
}) {
    const { name, dimensions } = formData;

    const result = await prisma.$transaction(async (tx) => {
        const blockType = await tx.blockType.create({
            data: {
                name,
                dimensions,
                isActive: true,
                yardStock: {
                    create: {
                        currentQuantity: 0
                    }
                }
            }
        });

        return blockType;
    });

    revalidatePath('/configuracion');
    revalidatePath('/produccion');
    revalidatePath('/ventas');
    return result;
}

export async function toggleBlockTypeActive(id: string, isActive: boolean) {
    const blockType = await prisma.blockType.update({
        where: { id },
        data: { isActive: !isActive }
    });

    revalidatePath('/configuracion');
    revalidatePath('/produccion');
    revalidatePath('/ventas');
    return blockType;
}
