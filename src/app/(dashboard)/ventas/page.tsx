import { getOrders, getClients } from "@/app/actions/ventas";
import { getBlockTypes, getWorkers } from "@/app/actions/production";
import { OrderForm } from "./OrderForm";
import { DispatchDialog } from "./DispatchDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import prisma from "@/lib/prisma";

async function getAdminId() {
    const user = await prisma.user.findFirst();
    return user?.id || '';
}

export default async function VentasPage() {
    const orders = await getOrders();
    const clients = await getClients();
    const blockTypes = await getBlockTypes();
    const workers = await getWorkers();
    const adminId = await getAdminId();

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pedidos y Ventas</h1>
                    <p className="text-muted-foreground mt-1">Gestión comercial y despachos de patio.</p>
                </div>
                <OrderForm clients={clients} blockTypes={blockTypes} userId={adminId} />
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b pb-4">
                    <CardTitle className="text-lg">Gestión de Pedidos</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                                <tr>
                                    <th className="px-6 py-4">Código / Fecha</th>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4 px-2">Detalle (Líneas)</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Total</th>
                                    <th className="px-6 py-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                            No hay pedidos registrados aún.
                                        </td>
                                    </tr>
                                ) : orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {order.code}
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {format(order.date, "dd MMM yyyy", { locale: es })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{order.client?.name}</td>
                                        <td className="px-6 py-4 text-xs text-slate-600">
                                            <ul className="list-disc list-inside">
                                                {order.orderLines.map((l: any) => (
                                                    <li key={l.id}>{l.quantity}x {l.blockType.name}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold
                        ${order.status === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'DESPACHADO' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-slate-900">
                                            ${order.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {order.status === 'PENDIENTE' || order.status === 'PREPARADO' ? (
                                                <DispatchDialog orderId={order.id} orderCode={order.code} workers={workers} />
                                            ) : (
                                                <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                                                    {order.dispatch?.weighingTicket?.netWeightKg} Kg Neto
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
