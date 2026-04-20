import { getDashboardStats } from "@/app/actions/dashboard";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Package, Factory, Truck, Plus
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
    const { kpis, pendingOrdersList, recentMovements } = await getDashboardStats();

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header with Quick Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Resumen Operativo</h1>
                    <p className="text-slate-500 mt-1 text-lg">Estado de patio y entregas</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link
                        href="/produccion?action=new"
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-300 rounded-lg shadow-sm text-slate-700 font-bold hover:bg-slate-50 transition-colors text-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Registrar Producción
                    </Link>
                    <Link
                        href="/ventas?action=new"
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 rounded-lg shadow-sm text-white font-bold hover:bg-blue-700 transition-colors text-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Venta
                    </Link>
                </div>
            </div>

            {/* Primary KPIs Layer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-semibold mb-1 text-lg">Stock Total en Patio</p>
                            <h3 className="text-5xl font-black text-slate-900 mt-2">{kpis.totalBlocksInYard}</h3>
                            <p className="text-sm text-green-600 font-bold mt-3">Unidades disponibles para venta</p>
                        </div>
                        <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                            <Package className="w-8 h-8 text-green-700" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-semibold mb-1 text-lg">Producción Semanal</p>
                            <h3 className="text-5xl font-black text-slate-900 mt-2">{kpis.blocksProducedThisWeek}</h3>
                            <p className="text-sm text-slate-500 font-bold mt-3">Hoy: <span className="text-blue-700">{kpis.blocksProducedToday}</span> bloques elaborados</p>
                        </div>
                        <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                            <Factory className="w-8 h-8 text-blue-700" />
                        </div>
                    </div>
                </div>

                <div className={`bg-white border rounded-xl p-6 shadow-sm ${kpis.pendingOrders > 0 ? 'border-orange-200' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={`${kpis.pendingOrders > 0 ? 'text-orange-700' : 'text-slate-500'} font-semibold mb-1 text-lg`}>Pedidos Pendientes</p>
                            <h3 className={`text-5xl font-black mt-2 ${kpis.pendingOrders > 0 ? 'text-orange-600' : 'text-slate-900'}`}>{kpis.pendingOrders}</h3>
                            <p className="text-sm text-slate-500 font-bold mt-3">Pendientes por entregar/despachar</p>
                        </div>
                        <div className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 ${kpis.pendingOrders > 0 ? 'bg-orange-100' : 'bg-slate-100'}`}>
                            <Truck className={`w-8 h-8 ${kpis.pendingOrders > 0 ? 'text-orange-600' : 'text-slate-500'}`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* List Layer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Orders (Despachos) */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-xl font-bold text-slate-900">Próximos Despachos</h2>
                    </div>
                    <div className="flex-1 p-0 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white text-slate-500 text-sm font-semibold">
                                <tr>
                                    <th className="px-6 py-4 border-b border-slate-100">Cliente</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Cant. Bloques</th>
                                    <th className="px-6 py-4 border-b border-slate-100 text-right">Pedido El</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {pendingOrdersList.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-slate-500 font-medium text-lg">
                                            No hay despachos pendientes. ¡Todo al día!
                                        </td>
                                    </tr>
                                ) : pendingOrdersList.map(order => {
                                    const totalBlocks = order.orderLines.reduce((acc, line) => acc + line.quantity, 0);
                                    return (
                                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-6">
                                                <div className="font-bold text-slate-900 text-lg">{order.client.name}</div>
                                                <div className="text-sm text-slate-500 font-medium mt-1">Ref: {order.code}</div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="font-black text-slate-800 text-xl">{totalBlocks}</span>
                                            </td>
                                            <td className="px-6 py-6 text-right text-base font-semibold text-slate-600">
                                                {format(order.date, "dd MMM", { locale: es })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Movimientos Recientes */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-xl font-bold text-slate-900">Últimos Movimientos</h2>
                    </div>
                    <div className="flex-1 p-0 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white text-slate-500 text-sm font-semibold">
                                <tr>
                                    <th className="px-6 py-4 border-b border-slate-100">Fecha</th>
                                    <th className="px-6 py-4 border-b border-slate-100">Tipo</th>
                                    <th className="px-6 py-4 border-b border-slate-100 text-right">Cantidad</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {recentMovements.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-slate-500 font-medium text-lg">
                                            Sin movimientos recientes.
                                        </td>
                                    </tr>
                                ) : recentMovements.map(mov => (
                                    <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-6 text-base font-semibold text-slate-600">
                                            {format(mov.date, "dd/MM HH:mm")}
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-black tracking-wide ${
                                                mov.type === 'IN_PRODUCTION' ? 'bg-blue-50 text-blue-700' :
                                                mov.type === 'OUT_DISPATCH' ? 'bg-orange-50 text-orange-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {mov.type === 'IN_PRODUCTION' ? 'PRODUCCIÓN' : mov.type === 'OUT_DISPATCH' ? 'DESPACHO' : 'AJUSTE'}
                                            </span>
                                            <div className="text-base font-bold text-slate-900 mt-2">{mov.blockType.name}</div>
                                        </td>
                                        <td className={`px-6 py-6 text-right font-black text-2xl ${
                                            mov.quantity > 0 ? 'text-green-600' : 'text-slate-900'
                                        }`}>
                                            {mov.quantity > 0 ? '+' : ''}{mov.quantity}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
