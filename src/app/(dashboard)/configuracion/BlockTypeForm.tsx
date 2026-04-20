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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!name || !dimensions) throw new Error("Nombre y dimensiones son obligatorios.");

            await createBlockType({ name, dimensions });

            toast.success("Tipo de Bloque Creado", { description: "La base de datos y el inventario están preparadas." });
            setOpen(false);

            setName("");
            setDimensions("");
        } catch (error: any) {
            toast.error("Error al registrar", { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm text-base"><Plus className="w-5 h-5 mr-2" /> Nuevo Molde / Producto</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-slate-200 shadow-xl rounded-xl">
                <DialogHeader className="border-b border-slate-100 pb-4 mb-4">
                    <DialogTitle className="text-xl font-bold text-slate-800">Alta de Molde y Producto</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold text-sm">Nombre del Producto</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Bloque Cara Vista 20x20x40" className="border-slate-300 text-base py-5" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold text-sm">Dimensiones (Texto descriptivo)</Label>
                        <Input value={dimensions} onChange={e => setDimensions(e.target.value)} required placeholder="Ej: 20x20x40 cm" className="border-slate-300 text-base py-5" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-300 shadow-sm">Cancelar</Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {loading ? "Creando..." : "Guardar Producto"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
