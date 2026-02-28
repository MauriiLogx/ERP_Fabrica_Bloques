'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getWorkers() {
    return await prisma.worker.findMany({
        orderBy: {
            lastName: 'asc'
        }
    });
}

export async function createWorker(formData: {
    firstName: string;
    lastName: string;
    dni: string;
    position: string;
    hireDate: Date;
}) {
    const { firstName, lastName, dni, position, hireDate } = formData;

    const existingDni = await prisma.worker.findUnique({
        where: { dni }
    });

    if (existingDni) {
        throw new Error("Ya existe un operario con este DNI.");
    }

    const worker = await prisma.worker.create({
        data: {
            firstName,
            lastName,
            dni,
            position,
            hireDate,
            isActive: true
        }
    });

    revalidatePath('/personal');
    // Also revalidate modules that use the workers list
    revalidatePath('/produccion');
    revalidatePath('/ventas');

    return worker;
}

export async function toggleWorkerStatus(id: string, isActive: boolean) {
    const worker = await prisma.worker.update({
        where: { id },
        data: { isActive: !isActive }
    });

    revalidatePath('/personal');
    revalidatePath('/produccion');
    revalidatePath('/ventas');
    return worker;
}
