import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function getDaysAgo(days: number) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
}

async function main() {
    console.log('Seeding database with simple block data...');

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
        prisma.worker.upsert({ where: { dni: '45678901D' }, update: {}, create: { firstName: 'Luis', lastName: 'Rodríguez', dni: '45678901D', position: 'FABRICACION' } })
    ]);

    // 3. Crear Tipos de Bloque
    const bloque20 = await prisma.blockType.create({
        data: {
            name: 'Bloque Estructural 20x20x40',
            dimensions: '20x20x40 cm',
            yardStock: { create: { currentQuantity: 1450 } }
        }
    });

    const bloque15 = await prisma.blockType.create({
        data: {
            name: 'Bloque Tabique 15x20x40',
            dimensions: '15x20x40 cm',
            yardStock: { create: { currentQuantity: 3200 } }
        }
    });

    const adoquin = await prisma.blockType.create({
        data: {
            name: 'Adoquín Hexagonal Rojo',
            dimensions: '25x25x8 cm',
            yardStock: { create: { currentQuantity: 5800 } }
        }
    });

    // 4. Clientes
    const cliente1 = await prisma.client.create({
        data: { name: 'Constructora Horizonte SRL', cif: 'C11223344', phone: '555-1020', address: 'Av. Las Palmas 450', commercialId: admin.id }
    });
    const cliente2 = await prisma.client.create({
        data: { name: 'Ferretería El Maestro', cif: 'F99887766', phone: '555-2030', address: 'Calle Principal 12', commercialId: admin.id }
    });

    // 5. Lotes de Producción Recientes (Dashboard)
    await prisma.productionBatch.create({
        data: {
            code: 'LOTE-2024-10-01', date: getDaysAgo(1), blockTypeId: bloque20.id, totalBlocksProduced: 800, createdById: admin.id,
            shift: 'MAÑANA',
            batchWorkers: { create: [{ workerId: workers[0].id, blocksProduced: 400 }, { workerId: workers[3].id, blocksProduced: 400 }] }
        }
    });

    await prisma.productionBatch.create({
        data: {
            code: 'LOTE-2024-10-02', date: getDaysAgo(3), blockTypeId: bloque15.id, totalBlocksProduced: 1200, createdById: admin.id,
            shift: 'TARDE',
            batchWorkers: { create: [{ workerId: workers[0].id, blocksProduced: 600 }, { workerId: workers[3].id, blocksProduced: 600 }] }
        }
    });

    await prisma.productionBatch.create({
        data: {
            code: 'LOTE-2024-09-28', date: getDaysAgo(6), blockTypeId: adoquin.id, totalBlocksProduced: 2500, createdById: admin.id,
            shift: 'MAÑANA',
            batchWorkers: { create: [{ workerId: workers[0].id, blocksProduced: 1000 }, { workerId: workers[3].id, blocksProduced: 1500 }] }
        }
    });

    // 6. Pedidos y Ventas
    const order1 = await prisma.order.create({
        data: {
            code: 'ORD-0001',
            clientId: cliente1.id, date: getDaysAgo(2), status: 'DESPACHADO', paymentStatus: 'PAGADO', totalAmount: 1850.00, createdById: admin.id,
            orderLines: { create: [{ blockTypeId: bloque20.id, quantity: 1000, unitPrice: 1.85, totalPrice: 1850.00 }] }
        }
    });

    const order2 = await prisma.order.create({
        data: {
            code: 'ORD-0002',
            clientId: cliente2.id, date: getDaysAgo(1), status: 'PENDIENTE', paymentStatus: 'PENDIENTE', totalAmount: 520.00, createdById: admin.id,
            orderLines: { create: [{ blockTypeId: bloque15.id, quantity: 400, unitPrice: 1.30, totalPrice: 520.00 }] }
        }
    });

    // 7. Despachos (Vinculados a Ordenes)
    await prisma.dispatch.create({
        data: {
            orderId: order1.id, dispatchDate: getDaysAgo(1), dispatchedByWorkerId: workers[1].id, totalBlocksDispatched: 1000,
            weighingTicket: {
                create: { grossWeightKg: 32000, tareWeightKg: 12000, netWeightKg: 20000 }
            }
        }
    });

    // 8. Movimientos de Stock en Patio Históricos (Kardex)
    await prisma.stockMovement.create({ data: { blockTypeId: bloque20.id, type: 'IN_PRODUCTION', quantity: 800, date: getDaysAgo(1), referenceId: 'LOTE-2024-10-01' } });
    await prisma.stockMovement.create({ data: { blockTypeId: bloque15.id, type: 'IN_PRODUCTION', quantity: 1200, date: getDaysAgo(3), referenceId: 'LOTE-2024-10-02' } });
    await prisma.stockMovement.create({ data: { blockTypeId: adoquin.id, type: 'IN_PRODUCTION', quantity: 2500, date: getDaysAgo(6), referenceId: 'LOTE-2024-09-28' } });
    await prisma.stockMovement.create({ data: { blockTypeId: bloque20.id, type: 'OUT_DISPATCH', quantity: -1000, date: getDaysAgo(1), referenceId: order1.id } });

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
