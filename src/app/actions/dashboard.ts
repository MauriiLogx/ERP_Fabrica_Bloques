'use server';

import prisma from '@/lib/prisma';

export async function getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday start

    const [
        yardStock,
        dailyBatches,
        weeklyBatches,
        pendingOrdersCount,
        pendingOrdersToday,
        recentMovements
    ] = await Promise.all([
        prisma.yardStock.aggregate({
            _sum: { currentQuantity: true }
        }),
        prisma.productionBatch.aggregate({
            _sum: { totalBlocksProduced: true },
            where: { date: { gte: today } }
        }),
        prisma.productionBatch.aggregate({
            _sum: { totalBlocksProduced: true },
            where: { date: { gte: startOfWeek } }
        }),
        prisma.order.count({
            where: { status: 'PENDIENTE' }
        }),
        prisma.order.findMany({
            where: { status: 'PENDIENTE' },
            include: { client: true, orderLines: { include: { blockType: true } } },
            orderBy: { date: 'asc' },
            take: 5
        }),
        prisma.stockMovement.findMany({
            include: { blockType: true },
            orderBy: { date: 'desc' },
            take: 10
        })
    ]);

    return {
        kpis: {
            totalBlocksInYard: yardStock._sum.currentQuantity || 0,
            blocksProducedToday: dailyBatches._sum.totalBlocksProduced || 0,
            blocksProducedThisWeek: weeklyBatches._sum.totalBlocksProduced || 0,
            pendingOrders: pendingOrdersCount
        },
        pendingOrdersList: pendingOrdersToday,
        recentMovements
    };
}
