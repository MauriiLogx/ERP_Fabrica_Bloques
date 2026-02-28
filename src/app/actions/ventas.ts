'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getOrders() {
    return await prisma.order.findMany({
        include: {
            client: true,
            orderLines: {
                include: { blockType: true }
            },
            dispatch: {
                include: {
                    weighingTicket: true,
                    dispatchedByWorker: true
                }
            }
        },
        orderBy: { date: 'desc' }
    });
}

export async function getClients() {
    return await prisma.client.findMany();
}

export async function createOrder(formData: {
    date: Date;
    clientId: string;
    createdById: string;
    lines: { blockTypeId: string; quantity: number; unitPrice: number }[];
}) {
    const { date, clientId, createdById, lines } = formData;

    if (lines.length === 0) throw new Error("El pedido debe tener al menos una línea.");
    if (lines.some(l => l.quantity <= 0 || l.unitPrice < 0)) throw new Error("Cantidad y precios inválidos.");

    const totalAmount = lines.reduce((acc, line) => acc + (line.quantity * line.unitPrice), 0);
    const code = `PED-${date.toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await prisma.order.create({
        data: {
            code,
            date,
            clientId,
            status: 'PENDIENTE',
            totalAmount,
            createdById,
            orderLines: {
                create: lines.map(l => ({
                    blockTypeId: l.blockTypeId,
                    quantity: l.quantity,
                    unitPrice: l.unitPrice,
                    totalPrice: l.quantity * l.unitPrice
                }))
            }
        }
    });

    revalidatePath('/ventas');
    return order;
}

export async function dispatchOrder(formData: {
    orderId: string;
    workerId: string;
    grossWeightKg: number;
    tareWeightKg: number;
}) {
    const { orderId, workerId, grossWeightKg, tareWeightKg } = formData;
    const netWeightKg = grossWeightKg - tareWeightKg;

    if (netWeightKg <= 0) throw new Error("El peso neto debe ser mayor que 0.");

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderLines: true }
    });

    if (!order) throw new Error("Pedido no encontrado");
    if (order.status === 'DESPACHADO' || order.status === 'COMPLETADO') throw new Error("Pedido ya despachado.");

    // Verificar stock en patio
    for (const line of order.orderLines) {
        const stock = await prisma.yardStock.findUnique({ where: { blockTypeId: line.blockTypeId } });
        if (!stock || stock.currentQuantity < line.quantity) {
            throw new Error(`Stock insuficiente para el bloque ID: ${line.blockTypeId}`);
        }
    }

    const numBlocksDispatched = order.orderLines.reduce((acc: number, l: any) => acc + l.quantity, 0);

    // Transacción ACID para despachar
    const dispatchResult = await prisma.$transaction(async (tx) => {
        // 1. Crear despacho
        const dispatchRow = await tx.dispatch.create({
            data: {
                orderId,
                dispatchDate: new Date(),
                dispatchedByWorkerId: workerId,
                totalBlocksDispatched: numBlocksDispatched,
                weighingTicket: {
                    create: {
                        grossWeightKg,
                        tareWeightKg,
                        netWeightKg
                    }
                }
            }
        });

        // 2. Actualizar estado del pedido
        await tx.order.update({
            where: { id: orderId },
            data: { status: 'DESPACHADO' }
        });

        // 3. Descontar Stock Patio y registrar Movimiento
        for (const line of order.orderLines) {
            await tx.yardStock.update({
                where: { blockTypeId: line.blockTypeId },
                data: { currentQuantity: { decrement: line.quantity } }
            });

            await tx.stockMovement.create({
                data: {
                    blockTypeId: line.blockTypeId,
                    type: 'OUT_DISPATCH',
                    quantity: -line.quantity,
                    date: new Date(),
                    referenceId: dispatchRow.id
                }
            });
        }

        return dispatchRow;
    });

    revalidatePath('/ventas');
    revalidatePath('/stock');
    return dispatchResult;
}
