import { getDashboardStats } from "@/app/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Users, Factory, ShoppingCart, Truck,
    TrendingUp, TrendingDown, AlertTriangle
} from "lucide-react";

export default async function DashboardPage() {
    const { kpis, recentMovements, lowStockMaterials } = await getDashboardStats();

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Panel de Control</h1>
                <p className="text-muted-foreground mt-1">Resumen general de operaciones (Últimos 30 días)</p>
            </div>

            {/* Primary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-100 shadow-md relative overflow-hidden group bg-gradient-to-br from-white to-slate-50">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Truck className="w-20 h-20 text-primary" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Ventas (30d)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">${kpis.salesLast30Days.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-md relative overflow-hidden group bg-gradient-to-br from-white to-slate-50">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Factory className="w-20 h-20 text-secondary" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Coste Prod. (30d)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">${kpis.productionCostLast30Days.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-md relative overflow-hidden group bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-20 h-20 text-primary" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-primary/80">Bloques Producidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-primary">{kpis.blocksProducedLast30Days}</div>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-md relative overflow-hidden group bg-gradient-to-br from-white to-slate-50">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="w-20 h-20 text-slate-400" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Operarios Activos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{kpis.activeWorkers}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Alerts Column */}
                <div className="space-y-6">
                    <Card className="border-red-200 shadow-sm">
                        <CardHeader className="bg-red-50 border-b border-red-100 pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-semibold text-red-900">Alertas de Stock (Materia Prima)</CardTitle>
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                        </CardHeader>
                        <CardContent className="p-0">
                            {lowStockMaterials.length === 0 ? (
                                <div className="p-4 text-sm text-green-700 bg-green-50/50">
                                    Todo el inventario está por encima del nivel mínimo.
                                </div>
                            ) : (
                                <ul className="divide-y divide-red-100">
                                    {lowStockMaterials.map(mat => (
                                        <li key={mat.id} className="p-4 flex justify-between items-center bg-white hover:bg-neutral-50 transition-colors">
                                            <div>
                                                <p className="font-medium text-slate-900 text-sm">{mat.name}</p>
                                                <p className="text-xs text-red-600 mt-0.5">Mínimo: {mat.minStockAlert} {mat.unit}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/10">
                                                    {mat.currentStock} {mat.unit}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50 border-b pb-3 relative overflow-hidden">
                            <div className="absolute right-[-10px] top-[-10px] opacity-10"><ShoppingCart className="w-16 h-16" /></div>
                            <CardTitle className="text-sm font-semibold text-slate-800">Cifras Base</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-sm text-slate-600">Stock Total en Patio (Unds)</span>
                                <span className="font-bold text-slate-900">{kpis.totalBlocksInYard}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-sm text-slate-600">Cartera de Clientes</span>
                                <span className="font-bold text-slate-900">{kpis.totalClients}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Tipos de Molde (Bloques)</span>
                                <span className="font-bold text-slate-900">{kpis.activeBlockTypes}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Column */}
                <div className="lg:col-span-2">
                    <Card className="border-slate-200 shadow-md h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                            <TrendingDown className="w-48 h-48" />
                        </div>
                        <CardHeader className="bg-white border-b pb-4">
                            <CardTitle className="text-lg text-slate-800 font-bold">Últimos Movimientos de Patio</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto relative z-10">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-3">Fecha</th>
                                            <th className="px-6 py-3">Bloque</th>
                                            <th className="px-6 py-3">Operación</th>
                                            <th className="px-6 py-3 text-right">Cant.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {recentMovements.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                                    No hay actividad reciente.
                                                </td>
                                            </tr>
                                        ) : recentMovements.map((mov) => (
                                            <tr key={mov.id} className="hover:bg-primary/5 transition-colors group bg-white">
                                                <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs">
                                                    {format(mov.date, "dd MMM HH:mm", { locale: es })}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-slate-800">{mov.blockType.name}</td>
                                                <td className="px-6 py-4">
                                                    {mov.type === 'IN_PRODUCTION' ? <span className="text-primary font-bold text-xs bg-primary/10 px-2 py-1 rounded-md">PRODUCCIÓN</span> : ''}
                                                    {mov.type === 'OUT_DISPATCH' ? <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded-md">DESPACHO</span> : ''}
                                                    {mov.type === 'ADJUSTMENT' ? <span className="text-orange-600 font-bold text-xs bg-orange-50 px-2 py-1 rounded-md">AJUSTE MANUAL</span> : ''}
                                                    <div className="text-[10px] text-slate-400 font-mono mt-1.5 opacity-70 group-hover:opacity-100 transition-opacity">{mov.referenceId}</div>
                                                </td>
                                                <td className={`px-6 py-4 text-right font-black text-base ${mov.quantity > 0 ? 'text-primary' : 'text-blue-600'}`}>
                                                    {mov.quantity > 0 ? '+' : ''}{mov.quantity}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
