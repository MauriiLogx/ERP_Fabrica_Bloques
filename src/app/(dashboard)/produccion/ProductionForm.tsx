'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProductionBatch } from "@/app/actions/production";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";

export function ProductionForm({ blockTypes, workers, userId }: any) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [shift, setShift] = useState("MAÑANA");
    const [blockTypeId, setBlockTypeId] = useState("");
    const [batchWorkers, setBatchWorkers] = useState([{ workerId: "", blocksProduced: 0 }]);

    const addWorkerRow = () => {
        setBatchWorkers([...batchWorkers, { workerId: "", blocksProduced: 0 }]);
    };

    const removeWorkerRow = (index: number) => {
        setBatchWorkers(batchWorkers.filter((_, i) => i !== index));
    };

    const updateWorker = (index: number, field: string, value: any) => {
        const newWorkers = [...batchWorkers];
        newWorkers[index] = { ...newWorkers[index], [field]: value };
        setBatchWorkers(newWorkers);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!blockTypeId) throw new Error("Debe seleccionar un tipo de bloque.");
            if (batchWorkers.length === 0) throw new Error("Debe agregar al menos un operario.");
            if (batchWorkers.some(w => !w.workerId || w.blocksProduced <= 0)) {
                throw new Error("Todos los operarios deben tener un ID y producción mayor a 0.");
            }

            await createProductionBatch({
                date: new Date(date),
                shift,
                blockTypeId,
                createdById: userId,
                workers: batchWorkers
            });

            toast.success("Lote registrado", { description: "La producción y el inventario han sido actualizados." });
            setOpen(false);

            // Reset form
            setBlockTypeId("");
            setBatchWorkers([{ workerId: "", blocksProduced: 0 }]);
        } catch (error: any) {
            toast.error("Error al guardar", { description: error.message || "Ocurrió un error inesperado." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm"><Plus className="w-4 h-4 mr-2" /> Registrar Lote</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] border-slate-200 shadow-xl rounded-xl">
                <DialogHeader className="border-b pb-4 mb-4">
                    <DialogTitle className="text-xl font-semibold text-slate-800">Registrar Producción</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-600">Fecha de Lote</Label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="border-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600">Turno</Label>
                            <Select value={shift} onValueChange={setShift} required>
                                <SelectTrigger className="border-slate-300">
                                    <SelectValue placeholder="Seleccionar turno" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MAÑANA">Mañana</SelectItem>
                                    <SelectItem value="TARDE">Tarde</SelectItem>
                                    <SelectItem value="NOCHE">Noche</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-600">Tipo de Bloque Producido</Label>
                        <Select value={blockTypeId} onValueChange={setBlockTypeId} required>
                            <SelectTrigger className="border-slate-300">
                                <SelectValue placeholder="Seleccionar molde / tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {blockTypes.map((bt: any) => (
                                    <SelectItem key={bt.id} value={bt.id}>{bt.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <Label className="text-slate-700 font-semibold">Producción por Operario</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addWorkerRow} className="h-8 border-slate-300 bg-white shadow-sm">
                                <Plus className="w-4 h-4 mr-1" /> Añadir
                            </Button>
                        </div>

                        {batchWorkers.map((bw, index) => (
                            <div key={index} className="flex gap-3 items-end">
                                <div className="flex-1 space-y-1">
                                    <Label className="text-xs text-slate-500">Operario</Label>
                                    <Select value={bw.workerId} onValueChange={(val) => updateWorker(index, 'workerId', val)}>
                                        <SelectTrigger className="bg-white border-slate-300">
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {workers.map((w: any) => (
                                                <SelectItem key={w.id} value={w.id}>{w.firstName} {w.lastName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-32 space-y-1">
                                    <Label className="text-xs text-slate-500">Cantidad</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={bw.blocksProduced || ''}
                                        onChange={e => updateWorker(index, 'blocksProduced', parseInt(e.target.value) || 0)}
                                        className="bg-white border-slate-300"
                                    />
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="mb-0.5 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeWorkerRow(index)} disabled={batchWorkers.length === 1}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-300 shadow-sm">Cancelar</Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {loading ? "Registrando..." : "Guardar Lote"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
