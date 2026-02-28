import { getBlockTypesWithFormulations } from "@/app/actions/configuracion";
import { BlockTypeForm } from "./BlockTypeForm";
import { BlockToggle } from "./BlockToggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Workflow, CheckCircle2, XCircle } from "lucide-react";

export default async function ConfiguracionPage() {
    const blockTypes = await getBlockTypesWithFormulations();

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuración General</h1>
                    <p className="text-muted-foreground mt-1">Gestión de Tipos de Bloque, Moldes y Fórmulas de Dosificación.</p>
                </div>
                <BlockTypeForm />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="bg-slate-50 border-b pb-4">
                        <div className="flex items-center gap-2">
                            <Workflow className="w-5 h-5 text-slate-600" />
                            <CardTitle className="text-lg">Catálogo de Productos y Fórmulas</CardTitle>
                        </div>
                        <CardDescription>
                            Define qué bloques fabrica la planta y la cantidad exacta de material necesario por unidad.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                                    <tr>
                                        <th className="px-6 py-4">Nombre Comercial</th>
                                        <th className="px-6 py-4">Dimensiones</th>
                                        <th className="px-6 py-4 bg-slate-100/50">Fórmula (Por Unidad)</th>
                                        <th className="px-6 py-4">Estado Productivo</th>
                                        <th className="px-6 py-4 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {blockTypes.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                                No hay tipos de bloque configurados en el sistema.
                                            </td>
                                        </tr>
                                    ) : blockTypes.map((bt) => (
                                        <tr key={bt.id} className={`hover:bg-slate-50 transition-colors ${!bt.isActive ? 'bg-slate-50/50 opacity-70' : ''}`}>
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {bt.name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">{bt.dimensions}</td>
                                            <td className="px-6 py-4 bg-slate-100/30">
                                                {bt.formulation ? (
                                                    <div className="text-xs space-y-1">
                                                        <div className="flex justify-between w-32">
                                                            <span className="text-slate-500">Cemento:</span>
                                                            <span className="font-semibold">{bt.formulation.cementKgPerBlock} Kg</span>
                                                        </div>
                                                        <div className="flex justify-between w-32">
                                                            <span className="text-slate-500">Arena:</span>
                                                            <span className="font-semibold">{bt.formulation.sandKgPerBlock} Kg</span>
                                                        </div>
                                                        <div className="flex justify-between w-32">
                                                            <span className="text-slate-500">Aditivo:</span>
                                                            <span className="font-semibold">{bt.formulation.additiveKgPerBlock} L</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-orange-600 italic">No definida</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {bt.isActive ? (
                                                    <span className="inline-flex items-center text-green-700 font-medium text-xs">
                                                        <CheckCircle2 className="w-4 h-4 mr-1" /> Activo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-slate-500 font-medium text-xs">
                                                        <XCircle className="w-4 h-4 mr-1" /> Suspendido
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <BlockToggle blockId={bt.id} isActive={bt.isActive} />
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
    );
}
