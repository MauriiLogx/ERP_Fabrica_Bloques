'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adjustYardStock } from "@/app/actions/stock";
import { toast } from "sonner";
import { Loader2, RefreshCcw } from "lucide-react";

export function AdjustmentDialog({ blockTypes }: { blockTypes: any[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [blockTypeId, setBlockTypeId] = useState("");
    const [quantityDiff, setQuantityDiff] = useState("");
    const [reason, setReason] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!blockTypeId) throw new Error("Seleccione el bloque a ajustar.");
            const diff = Number(quantityDiff);
            if (diff === 0) throw new Error("La cantidad de ajuste no puede ser 0.");
            if (!reason.trim()) throw new Error("Proporcione un motivo para el ajuste.");

            await adjustYardStock({
                blockTypeId,
                quantityDiff: diff,
                reason: reason.trim()
            });

            toast.success("Stock Ajustado", { description: "Se ha actualizado el inventario en patio." });
            setOpen(false);
            setQuantityDiff("");
            setReason("");
        } catch (error: any) {
            toast.error("Error al ajustar", { description: error.message || "Ocurrió un error inesperado." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-white border-slate-300 shadow-sm text-slate-700 hover:bg-slate-50"><RefreshCcw className="w-4 h-4 mr-2 text-slate-500" /> Ajuste Manual</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] border-slate-200 shadow-xl rounded-xl">
                <DialogHeader className="border-b pb-4 mb-4">
                    <DialogTitle className="text-xl font-semibold text-slate-800">Ajustar Inventario</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-600">Tipo de Bloque</Label>
                        <Select value={blockTypeId} onValueChange={setBlockTypeId} required>
                            <SelectTrigger className="border-slate-300">
                                <SelectValue placeholder="Seleccionar bloque" />
                            </SelectTrigger>
                            <SelectContent>
                                {blockTypes.map((bt: any) => (
                                    <SelectItem key={bt.id} value={bt.id}>{bt.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-600">Cantidad (Positiva sumar, Negativa restar)</Label>
                        <Input type="number" step="1" value={quantityDiff} onChange={e => setQuantityDiff(e.target.value)} required placeholder="Ej: -50 o +20" className="border-slate-300 font-mono" />
                        <p className="text-xs text-slate-500 mt-1">
                            Útil para mermas, conteos físicos o bloqueos por calidad.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-600">Motivo del Ajuste</Label>
                        <Input value={reason} onChange={e => setReason(e.target.value)} required placeholder="Ej: Merma por rotura" className="border-slate-300" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-300 shadow-sm">Cancelar</Button>
                        <Button type="submit" disabled={loading} className="bg-slate-800 hover:bg-slate-900 shadow-sm">
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {loading ? "Ajustando..." : "Confirmar Ajuste"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
