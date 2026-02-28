import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function getDaysAgo(days: number) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
}

async function main() {
    console.log('Seeding database with rich data...');

    // 1. Crear usuario administrador
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@fabrica.com' },
        update: {
            password_hash: passwordHash
        },
        create: {
            name: 'Administrador ERP',
            email: 'admin@fabrica.com',
            password_hash: passwordHash,
            role: 'ADMIN',
        },
    });

    // 2. Crear Operarios Variados
    const workers = await Promise.all([
        prisma.worker.upsert({ where: { dni: '12345678A' }, update: {}, create: { firstName: 'Juan', lastName: 'Pérez', dni: '12345678A', position: 'FABRICACION' } }),
        prisma.worker.upsert({ where: { dni: '23456789B' }, update: {}, create: { firstName: 'Carlos', lastName: 'Gómez', dni: '23456789B', position: 'DESPACHO' } }),
        prisma.worker.upsert({ where: { dni: '34567890C' }, update: {}, create: { firstName: 'Ana', lastName: 'Martínez', dni: '34567890C', position: 'BASCULA' } }),
        prisma.worker.upsert({ where: { dni: '45678901D' }, update: {}, create: { firstName: 'Luis', lastName: 'Rodríguez', dni: '45678901D', position: 'FABRICACION' } }),
        prisma.worker.upsert({ where: { dni: '56789012E' }, update: {}, create: { firstName: 'Miguel', lastName: 'Fernández', dni: '56789012E', position: 'FABRICACION', isActive: false } })
    ]);

    // 3. Crear Tipos de Bloque y Fórmulas
    const bloque20 = await prisma.blockType.create({
        data: {
            name: 'Bloque Estructural 20x20x40',
            dimensions: '20x20x40 cm',
            formulation: { create: { cementKgPerBlock: 1.5, sandKgPerBlock: 8.5, additiveKgPerBlock: 0.1 } },
            yardStock: { create: { currentQuantity: 1450 } }
        }
    });

    const bloque15 = await prisma.blockType.create({
        data: {
            name: 'Bloque Tabique 15x20x40',
            dimensions: '15x20x40 cm',
            formulation: { create: { cementKgPerBlock: 1.2, sandKgPerBlock: 7.0, additiveKgPerBlock: 0.08 } },
            yardStock: { create: { currentQuantity: 3200 } }
        }
    });

    const adoquin = await prisma.blockType.create({
        data: {
            name: 'Adoquín Hexagonal Rojo',
            dimensions: '25x25x8 cm',
            formulation: { create: { cementKgPerBlock: 0.8, sandKgPerBlock: 4.5, additiveKgPerBlock: 0.2 } },
            yardStock: { create: { currentQuantity: 5800 } }
        }
    });

    // 4. Materias Primas
    const cemento = await prisma.rawMaterial.create({
        data: { name: 'Cemento Portland Tipo I', unit: 'KG', currentStock: 8500, minStockAlert: 2000, averageUnitPrice: 0.14 }
    });

    const arena = await prisma.rawMaterial.create({
        data: { name: 'Arena Fina Lavada', unit: 'KG', currentStock: 45000, minStockAlert: 10000, averageUnitPrice: 0.04 }
    });

    const arenaGruesa = await prisma.rawMaterial.create({
        data: { name: 'Arena Gruesa / Gravilla', unit: 'KG', currentStock: 12000, minStockAlert: 5000, averageUnitPrice: 0.03 }
    });

    const aditivo = await prisma.rawMaterial.create({
        data: { name: 'Aditivo Plastificante Sika', unit: 'LITRO', currentStock: 150, minStockAlert: 50, averageUnitPrice: 3.20 }
    });

    const pigmento = await prisma.rawMaterial.create({
        data: { name: 'Pigmento Óxido de Hierro Rojo', unit: 'KG', currentStock: 25, minStockAlert: 30, averageUnitPrice: 8.50 }
    });

    // 5. Proveedores
    const provCem = await prisma.supplier.create({
        data: { name: 'Cementos Nacionales S.A.', cif: 'A12345678', contactInfo: 'ventas@cemnac.com - 555-0192' }
    });
    const provArena = await prisma.supplier.create({
        data: { name: 'Áridos y Canteras del Sur', cif: 'B87654321', contactInfo: 'logistica@aridosur.com - 555-8832' }
    });

    // 6. Compras Recientes (para el Dashboard)
    await prisma.rawMaterialPurchase.create({
        data: { supplierId: provCem.id, materialId: cemento.id, date: getDaysAgo(2), invoiceNumber: 'INV-2024-089', quantity: 5000, unitPrice: 0.14, totalPrice: 700 }
    });
    await prisma.rawMaterialPurchase.create({
        data: { supplierId: provArena.id, materialId: arena.id, date: getDaysAgo(5), invoiceNumber: 'FAC-001452', quantity: 20000, unitPrice: 0.04, totalPrice: 800 }
    });
    await prisma.rawMaterialPurchase.create({
        data: { supplierId: provArena.id, materialId: arenaGruesa.id, date: getDaysAgo(12), invoiceNumber: 'FAC-001420', quantity: 15000, unitPrice: 0.03, totalPrice: 450 }
    });

    // 7. Clientes
    const cliente1 = await prisma.client.create({
        data: { name: 'Constructora Horizonte SRL', cif: 'C11223344', phone: '555-1020', address: 'Av. Las Palmas 450', commercialId: admin.id }
    });
    const cliente2 = await prisma.client.create({
        data: { name: 'Ferretería El Maestro', cif: 'F99887766', phone: '555-2030', address: 'Calle Principal 12', commercialId: admin.id }
    });
    const cliente3 = await prisma.client.create({
        data: { name: 'Inmobiliaria Vistas del Valle', cif: 'I55443322', phone: '555-3040', address: 'Ruta 5 Km 12', commercialId: admin.id }
    });

    // 8. Lotes de Producción Recientes (Dashboard)
    await prisma.productionBatch.create({
        data: {
            code: 'LOTE-2024-10-01', date: getDaysAgo(1), blockTypeId: bloque20.id, totalBlocksProduced: 800, totalCost: 150.50, createdById: admin.id,
            shift: 'MAÑANA', costCement: 120, costSand: 20, costAdditive: 10.50, unitCostPerBlock: 0.188,
            batchWorkers: { create: [{ workerId: workers[0].id, blocksProduced: 400 }, { workerId: workers[3].id, blocksProduced: 400 }] }
        }
    });

    await prisma.productionBatch.create({
        data: {
            code: 'LOTE-2024-10-02', date: getDaysAgo(3), blockTypeId: bloque15.id, totalBlocksProduced: 1200, totalCost: 135.20, createdById: admin.id,
            shift: 'TARDE', costCement: 100, costSand: 25, costAdditive: 10.20, unitCostPerBlock: 0.112,
            batchWorkers: { create: [{ workerId: workers[0].id, blocksProduced: 600 }, { workerId: workers[3].id, blocksProduced: 600 }] }
        }
    });

    await prisma.productionBatch.create({
        data: {
            code: 'LOTE-2024-09-28', date: getDaysAgo(6), blockTypeId: adoquin.id, totalBlocksProduced: 2500, totalCost: 200.00, createdById: admin.id,
            shift: 'MAÑANA', costCement: 150, costSand: 30, costAdditive: 20.00, unitCostPerBlock: 0.08,
            batchWorkers: { create: [{ workerId: workers[0].id, blocksProduced: 1000 }, { workerId: workers[3].id, blocksProduced: 1500 }] }
        }
    });

    // Lote antiguo para ver diferencias en gráficos (si los hubiera)
    await prisma.productionBatch.create({
        data: {
            code: 'LOTE-2024-08-15', date: getDaysAgo(45), blockTypeId: bloque20.id, totalBlocksProduced: 1000, totalCost: 180.00, createdById: admin.id,
            shift: 'MAÑANA', costCement: 140, costSand: 25, costAdditive: 15.00, unitCostPerBlock: 0.18,
            batchWorkers: { create: [{ workerId: workers[0].id, blocksProduced: 1000 }] }
        }
    });

    // 9. Pedidos y Ventas
    const order1 = await prisma.order.create({
        data: {
            code: 'ORD-0001',
            clientId: cliente1.id, date: getDaysAgo(2), status: 'DESPACHADO', totalAmount: 1850.00, createdById: admin.id,
            orderLines: { create: [{ blockTypeId: bloque20.id, quantity: 1000, unitPrice: 1.85, totalPrice: 1850.00 }] }
        }
    });

    const order2 = await prisma.order.create({
        data: {
            code: 'ORD-0002',
            clientId: cliente2.id, date: getDaysAgo(1), status: 'PENDIENTE', totalAmount: 520.00, createdById: admin.id,
            orderLines: { create: [{ blockTypeId: bloque15.id, quantity: 400, unitPrice: 1.30, totalPrice: 520.00 }] }
        }
    });

    const order3 = await prisma.order.create({
        data: {
            code: 'ORD-0003',
            clientId: cliente3.id, date: getDaysAgo(4), status: 'DESPACHADO', totalAmount: 2475.00, createdById: admin.id,
            orderLines: {
                create: [
                    { blockTypeId: adoquin.id, quantity: 1500, unitPrice: 0.65, totalPrice: 975.00 },
                    { blockTypeId: bloque20.id, quantity: 800, unitPrice: 1.875, totalPrice: 1500.00 }
                ]
            }
        }
    });

    // 10. Despachos (Vinculados a Ordenes)
    await prisma.dispatch.create({
        data: {
            orderId: order1.id, dispatchDate: getDaysAgo(1), dispatchedByWorkerId: workers[1].id, totalBlocksDispatched: 1000,
            weighingTicket: {
                create: { grossWeightKg: 32000, tareWeightKg: 12000, netWeightKg: 20000 }
            }
        }
    });

    await prisma.dispatch.create({
        data: {
            orderId: order3.id, dispatchDate: getDaysAgo(3), dispatchedByWorkerId: workers[1].id, totalBlocksDispatched: 2300,
            weighingTicket: {
                create: { grossWeightKg: 40000, tareWeightKg: 15000, netWeightKg: 25000 }
            }
        }
    });

    // 11. Movimientos de Stock en Patio Históricos (Kardex)
    await prisma.stockMovement.create({ data: { blockTypeId: bloque20.id, type: 'IN_PRODUCTION', quantity: 800, date: getDaysAgo(1), referenceId: 'LOTE-2024-10-01' } });
    await prisma.stockMovement.create({ data: { blockTypeId: bloque15.id, type: 'IN_PRODUCTION', quantity: 1200, date: getDaysAgo(3), referenceId: 'LOTE-2024-10-02' } });
    await prisma.stockMovement.create({ data: { blockTypeId: adoquin.id, type: 'IN_PRODUCTION', quantity: 2500, date: getDaysAgo(6), referenceId: 'LOTE-2024-09-28' } });
    await prisma.stockMovement.create({ data: { blockTypeId: bloque20.id, type: 'OUT_DISPATCH', quantity: -1000, date: getDaysAgo(1), referenceId: order1.id } });
    await prisma.stockMovement.create({ data: { blockTypeId: adoquin.id, type: 'OUT_DISPATCH', quantity: -1500, date: getDaysAgo(3), referenceId: order3.id } });
    await prisma.stockMovement.create({ data: { blockTypeId: bloque20.id, type: 'OUT_DISPATCH', quantity: -800, date: getDaysAgo(3), referenceId: order3.id } });
    await prisma.stockMovement.create({ data: { blockTypeId: bloque20.id, type: 'ADJUSTMENT', quantity: -50, date: getDaysAgo(0), referenceId: 'ADJ-MERMA-ROTURA' } });


    console.log('Database seeded successfully with realistic data!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
