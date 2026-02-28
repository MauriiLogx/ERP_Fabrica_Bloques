'use server';

import prisma from '@/lib/prisma';

export async function getDashboardStats() {
    const [
        totalWorkers,
        totalClients,
        totalBlockTypes,
        recentPurchases,
        recentOrders,
        recentBatches,
        yardStock
    ] = await Promise.all([
        prisma.worker.count({ where: { isActive: true } }),
        prisma.client.count(),
        prisma.blockType.count(),
        prisma.rawMaterialPurchase.aggregate({
            _sum: { totalPrice: true },
            where: { date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } }
        }),
        prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                status: { in: ['COMPLETADO', 'DESPACHADO'] },
                date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
            }
        }),
        prisma.productionBatch.aggregate({
            _sum: { totalBlocksProduced: true, totalCost: true },
            where: { date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } }
        }),
        prisma.yardStock.aggregate({
            _sum: { currentQuantity: true }
        })
    ]);

    const recentMovements = await prisma.stockMovement.findMany({
        include: { blockType: true },
        orderBy: { date: 'desc' },
        take: 5
    });

    const lowStockMaterials = await prisma.rawMaterial.findMany({
        where: {
            currentStock: { lte: prisma.rawMaterial.fields.minStockAlert }
        }
    });

    return {
        kpis: {
            activeWorkers: totalWorkers,
            totalClients,
            activeBlockTypes: totalBlockTypes,
            purchasesLast30Days: recentPurchases._sum.totalPrice || 0,
            salesLast30Days: recentOrders._sum.totalAmount || 0,
            blocksProducedLast30Days: recentBatches._sum.totalBlocksProduced || 0,
            productionCostLast30Days: recentBatches._sum.totalCost || 0,
            totalBlocksInYard: yardStock._sum.currentQuantity || 0
        },
        recentMovements,
        lowStockMaterials
    };
}
