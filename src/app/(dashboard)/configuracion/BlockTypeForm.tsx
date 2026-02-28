'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBlockType } from "@/app/actions/configuracion";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

export function BlockTypeForm() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState("");
    const [dimensions, setDimensions] = useState("");
    const [cementKg, setCementKg] = useState("");
    const [sandKg, setSandKg] = useState("");
    const [additiveKg, setAdditiveKg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!name || !dimensions) throw new Error("Nombre y dimensiones son obligatorios.");
            const c = Number(cementKg);
            const s = Number(sandKg);
            const a = Number(additiveKg);

            if (c < 0 || s < 0 || a < 0) throw new Error("Las fórmulas no pueden tener cantidades negativas.");

            await createBlockType({
                name, dimensions, cementKg: c, sandKg: s, additiveKg: a
            });

            toast.success("Tipo de Bloque Creado", { description: "La base de datos y el inventario están preparadas." });
            setOpen(false);

            setName("");
            setDimensions("");
            setCementKg("");
            setSandKg("");
            setAdditiveKg("");
        } catch (error: any) {
            toast.error("Error al registrar", { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-slate-800 hover:bg-slate-900 shadow-sm"><Plus className="w-4 h-4 mr-2" /> Nuevo Molde / Bloque</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-slate-200 shadow-xl rounded-xl">
                <DialogHeader className="border-b pb-4 mb-4">
                    <DialogTitle className="text-xl font-semibold text-slate-800">Alta de Molde y Fórmula</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-600">Nombre del Tipo de Bloque</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Bloque Cara Vista 20x20x40" className="border-slate-300" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-600">Dimensiones (Texto descriptivo)</Label>
                        <Input value={dimensions} onChange={e => setDimensions(e.target.value)} required placeholder="Ej: 20x20x40 cm" className="border-slate-300" />
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        <h4 className="font-semibold text-slate-700 mb-3 text-sm">Dosificación Ponderada (Por Unidad de Bloque)</h4>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">Cemento (Kg)</Label>
                                <Input type="number" step="0.0001" value={cementKg} onChange={e => setCementKg(e.target.value)} required placeholder="0.00" className="border-slate-300 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">Arena (Kg)</Label>
                                <Input type="number" step="0.0001" value={sandKg} onChange={e => setSandKg(e.target.value)} required placeholder="0.00" className="border-slate-300 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-500">Aditivo (L / Kg)</Label>
                                <Input type="number" step="0.0001" value={additiveKg} onChange={e => setAdditiveKg(e.target.value)} required placeholder="0.00" className="border-slate-300 text-sm" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-300 shadow-sm">Cancelar</Button>
                        <Button type="submit" disabled={loading} className="bg-slate-800 hover:bg-slate-900 shadow-sm">
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {loading ? "Creando..." : "Guardar Tipo"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
