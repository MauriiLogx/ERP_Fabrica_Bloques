import { getBlockTypes } from "@/app/actions/configuracion";
import { BlockTypeForm } from "./BlockTypeForm";
import { BlockToggle } from "./BlockToggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Workflow, CheckCircle2, XCircle } from "lucide-react";

export default async function ConfiguracionPage() {
    const blockTypes = await getBlockTypes();

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuración General</h1>
                    <p className="text-muted-foreground mt-1">Gestión de Tipos de Bloques y Moldes.</p>
                </div>
                <BlockTypeForm />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="bg-slate-50 border-b pb-4">
                        <div className="flex items-center gap-2">
                            <Workflow className="w-5 h-5 text-slate-600" />
                            <CardTitle className="text-lg">Catálogo de Productos</CardTitle>
                        </div>
                        <CardDescription>
                            Define qué bloques o productos terminados fabrica la planta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white text-slate-600 font-medium border-b">
                                    <tr>
                                        <th className="px-6 py-4">Nombre Comercial</th>
                                        <th className="px-6 py-4">Dimensiones</th>
                                        <th className="px-6 py-4">Estado Productivo</th>
                                        <th className="px-6 py-4 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {blockTypes.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground font-medium">
                                                No hay tipos de bloque configurados en el sistema.
                                            </td>
                                        </tr>
                                    ) : blockTypes.map((bt) => (
                                        <tr key={bt.id} className={`hover:bg-slate-50 transition-colors ${!bt.isActive ? 'bg-slate-50/50 opacity-70' : ''}`}>
                                            <td className="px-6 py-5 font-bold text-slate-900 text-base">
                                                {bt.name}
                                            </td>
                                            <td className="px-6 py-5 text-slate-600 font-medium">{bt.dimensions}</td>
                                            <td className="px-6 py-5">
                                                {bt.isActive ? (
                                                    <span className="inline-flex items-center text-green-700 font-bold bg-green-50 px-3 py-1 rounded-md text-xs">
                                                        <CheckCircle2 className="w-4 h-4 mr-1" /> Activo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-md text-xs">
                                                        <XCircle className="w-4 h-4 mr-1" /> Suspendido
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-center">
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
