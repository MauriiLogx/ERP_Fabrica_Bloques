import { getWorkers } from "@/app/actions/personal";
import { WorkerForm } from "./WorkerForm";
import { ActiveToggle } from "./ActiveToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { HardHat, Truck, Scale } from "lucide-react";

export default async function PersonalPage() {
    const workers = await getWorkers();

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Personal y Operarios</h1>
                    <p className="text-muted-foreground mt-1">Gestión de la plantilla de trabajadores de la planta.</p>
                </div>
                <WorkerForm />
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b pb-4">
                    <CardTitle className="text-lg">Nómina Activa e Histórica</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                                <tr>
                                    <th className="px-6 py-4">Apellidos y Nombres</th>
                                    <th className="px-6 py-4">DNI / ID</th>
                                    <th className="px-6 py-4">Puesto Asignado</th>
                                    <th className="px-6 py-4">Contratación</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {workers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                            No hay operarios registrados en el sistema.
                                        </td>
                                    </tr>
                                ) : workers.map((w) => (
                                    <tr key={w.id} className={`hover:bg-slate-50 transition-colors ${!w.isActive ? 'bg-slate-50/50 opacity-70' : ''}`}>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {w.lastName}, {w.firstName}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{w.dni}</td>
                                        <td className="px-6 py-4">
                                            {w.position === 'FABRICACION' && <span className="flex items-center text-slate-700"><HardHat className="w-4 h-4 mr-2" /> Planta</span>}
                                            {w.position === 'DESPACHO' && <span className="flex items-center text-blue-700"><Truck className="w-4 h-4 mr-2" /> Logística</span>}
                                            {w.position === 'BASCULA' && <span className="flex items-center text-orange-700"><Scale className="w-4 h-4 mr-2" /> Báscula</span>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {format(w.hireDate, "dd MMM yyyy", { locale: es })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {w.isActive ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
                                                    Inactivo / Baja
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <ActiveToggle workerId={w.id} isActive={w.isActive} />
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
