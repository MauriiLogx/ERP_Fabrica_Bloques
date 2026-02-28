'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dispatchOrder } from "@/app/actions/ventas";
import { toast } from "sonner";
import { Loader2, Truck } from "lucide-react";

export function DispatchDialog({ orderId, orderCode, workers }: { orderId: string, orderCode: string, workers: any[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [workerId, setWorkerId] = useState("");
    const [grossWeight, setGrossWeight] = useState("");
    const [tareWeight, setTareWeight] = useState("");

    const netWeight = (Number(grossWeight) - Number(tareWeight)).toFixed(2);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!workerId) throw new Error("Seleccione al operario responsable del despacho.");
            const bruto = Number(grossWeight);
            const tara = Number(tareWeight);
            if (bruto <= 0 || tara <= 0 || bruto <= tara) {
                throw new Error("El peso bruto debe ser mayor a la tara, y ambos mayores a 0.");
            }

            await dispatchOrder({
                orderId,
                workerId,
                grossWeightKg: bruto,
                tareWeightKg: tara
            });

            toast.success("Pedido Despachado", { description: "Se ha descontado del stock en patio exitosamente." });
            setOpen(false);
        } catch (error: any) {
            toast.error("Error al despachar", { description: error.message || "Ocurrió un error inesperado." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-slate-800 hover:bg-slate-900 shadow-sm text-xs h-8"><Truck className="w-3.5 h-3.5 mr-1.5" /> Despachar</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] border-slate-200 shadow-xl rounded-xl">
                <DialogHeader className="border-b pb-4 mb-4">
                    <DialogTitle className="text-xl font-semibold text-slate-800">Despachar Pedido {orderCode}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-600">Transportista / Operario Despacho</Label>
                        <Select value={workerId} onValueChange={setWorkerId} required>
                            <SelectTrigger className="border-slate-300">
                                <SelectValue placeholder="Seleccionar operario" />
                            </SelectTrigger>
                            <SelectContent>
                                {workers.map((w: any) => (
                                    <SelectItem key={w.id} value={w.id}>{w.firstName} {w.lastName} (DNI: {w.dni})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-600">Tara (Kg) - Vacío</Label>
                            <Input type="number" step="0.1" value={tareWeight} onChange={e => setTareWeight(e.target.value)} required placeholder="Ej: 8000" className="border-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600">Peso Bruto (Kg)</Label>
                            <Input type="number" step="0.1" value={grossWeight} onChange={e => setGrossWeight(e.target.value)} required placeholder="Ej: 24000" className="border-slate-300" />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-700 font-medium text-center border border-slate-200">
                        Carga Neta: <span className="text-lg text-blue-700 ml-2">{Number(netWeight) > 0 ? netWeight : 0} Kg</span>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-300 shadow-sm">Cancelar</Button>
                        <Button type="submit" disabled={loading} className="bg-slate-800 hover:bg-slate-900 shadow-sm">
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {loading ? "Procesando..." : "Confirmar Despacho"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
