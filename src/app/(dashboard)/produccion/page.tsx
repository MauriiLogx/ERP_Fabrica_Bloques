import { getBlockTypes, getProductionBatches, getWorkers } from "@/app/actions/production";
import { ProductionForm } from "./ProductionForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import prisma from "@/lib/prisma";

// Buscamos el admin o primer usuario para pasarlo como createdById en el MVP
async function getAdminId() {
    const user = await prisma.user.findFirst();
    return user?.id || '';
}

export default async function ProduccionPage() {
    const batches = await getProductionBatches();
    const blockTypes = await getBlockTypes();
    const workers = await getWorkers();
    const adminId = await getAdminId();

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Producción y Lotes</h1>
                    <p className="text-muted-foreground mt-1">Gestión diaria del proceso de fabricación.</p>
                </div>
                <ProductionForm blockTypes={blockTypes} workers={workers} userId={adminId} />
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b pb-4">
                    <CardTitle className="text-lg">Historial de Lotes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                                <tr>
                                    <th className="px-6 py-4">Código</th>
                                    <th className="px-6 py-4">Fecha / Turno</th>
                                    <th className="px-6 py-4">Bloque</th>
                                    <th className="px-6 py-4 text-right">Cantidad</th>
                                    <th className="px-6 py-4 text-right">Coste Total / Un.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {batches.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                            No hay lotes registrados aún.
                                        </td>
                                    </tr>
                                ) : batches.map((batch) => (
                                    <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{batch.code}</td>
                                        <td className="px-6 py-4">
                                            {format(batch.date, "dd MMM yyyy", { locale: es })}
                                            <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                {batch.shift}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{batch.blockType.name}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-slate-700">{batch.totalBlocksProduced} unds.</td>
                                        <td className="px-6 py-4 text-right">
                                            ${batch.totalCost.toFixed(2)}
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                ${batch.unitCostPerBlock.toFixed(4)} c/u
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
