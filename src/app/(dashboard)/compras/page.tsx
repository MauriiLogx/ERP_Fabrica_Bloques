import { getPurchases, getSuppliers, getRawMaterials } from "@/app/actions/compras";
import { CompraForm } from "./CompraForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function ComprasPage() {
    const purchases = await getPurchases();
    const suppliers = await getSuppliers();
    const materials = await getRawMaterials();

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Compras de Materia Prima</h1>
                    <p className="text-muted-foreground mt-1">Gestión de abastecimiento e ingreso a inventario.</p>
                </div>
                <CompraForm suppliers={suppliers} materials={materials} />
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b pb-4">
                    <CardTitle className="text-lg">Últimas Compras</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                                <tr>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Factura / Albarán</th>
                                    <th className="px-6 py-4">Proveedor</th>
                                    <th className="px-6 py-4">Material</th>
                                    <th className="px-6 py-4 text-right">Cantidad</th>
                                    <th className="px-6 py-4 text-right">Precio Unit. / Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {purchases.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                            No hay compras registradas aún.
                                        </td>
                                    </tr>
                                ) : purchases.map((purchase) => (
                                    <tr key={purchase.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {format(purchase.date, "dd MMM yyyy", { locale: es })}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {purchase.invoiceNumber || '-'}
                                        </td>
                                        <td className="px-6 py-4">{purchase.supplier?.name || 'Varios/Desconocido'}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-700">{purchase.material.name}</td>
                                        <td className="px-6 py-4 text-right">
                                            {purchase.quantity} <span className="text-muted-foreground text-xs">{purchase.material.unit}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            ${purchase.totalPrice.toFixed(2)}
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                ${purchase.unitPrice.toFixed(4)} c/u
                                            </div>
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
