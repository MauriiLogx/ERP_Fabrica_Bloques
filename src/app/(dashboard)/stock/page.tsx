import { getYardStock, getStockMovements } from "@/app/actions/stock";
import { getBlockTypes } from "@/app/actions/production";
import { AdjustmentDialog } from "./AdjustmentDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Package, ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";

export default async function StockPage() {
    const stock = await getYardStock();
    const movements = await getStockMovements();
    const blockTypes = await getBlockTypes();

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Stock en Patio</h1>
                    <p className="text-muted-foreground mt-1">Inventario actual de bloques listos para despacho.</p>
                </div>
                <AdjustmentDialog blockTypes={blockTypes} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stock.length === 0 ? (
                    <div className="col-span-3 p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-500">
                        No hay stock registrado en patio todavía.
                    </div>
                ) : stock.map(item => (
                    <Card key={item.id} className="border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Package className="w-16 h-16" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-slate-600 font-medium text-sm">{item.blockType.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold tracking-tight text-slate-900">{item.currentQuantity}</span>
                                <span className="text-sm font-medium text-slate-500">unds.</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-slate-200 shadow-sm mt-8">
                <CardHeader className="bg-slate-50 border-b pb-4">
                    <CardTitle className="text-lg">Kardex de Movimientos (Últimos 100)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                                <tr>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Tipo Movimiento</th>
                                    <th className="px-6 py-4">Bloque</th>
                                    <th className="px-6 py-4">Referencia</th>
                                    <th className="px-6 py-4 text-right">Cantidad</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {movements.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                            No hay movimientos registrados.
                                        </td>
                                    </tr>
                                ) : movements.map((mov) => (
                                    <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {format(mov.date, "dd MMM yyyy HH:mm", { locale: es })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {mov.type === 'IN_PRODUCTION' && (
                                                <span className="inline-flex items-center text-green-700 bg-green-50 px-2 py-1 rounded-md text-xs font-semibold">
                                                    <ArrowUpRight className="w-3 h-3 mr-1" /> Entrada (Producción)
                                                </span>
                                            )}
                                            {mov.type === 'OUT_DISPATCH' && (
                                                <span className="inline-flex items-center text-blue-700 bg-blue-50 px-2 py-1 rounded-md text-xs font-semibold">
                                                    <ArrowDownRight className="w-3 h-3 mr-1" /> Salida (Despacho)
                                                </span>
                                            )}
                                            {mov.type === 'ADJUSTMENT' && (
                                                <span className="inline-flex items-center text-orange-700 bg-orange-50 px-2 py-1 rounded-md text-xs font-semibold">
                                                    <RefreshCcw className="w-3 h-3 mr-1" /> Ajuste Manual
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">{mov.blockType.name}</td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{mov.referenceId}</td>
                                        <td className={`px-6 py-4 text-right font-semibold ${mov.quantity > 0 ? 'text-green-600' : 'text-blue-600'}`}>
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
    );
}
