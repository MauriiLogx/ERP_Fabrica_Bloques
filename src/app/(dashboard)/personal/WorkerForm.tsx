'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createWorker } from "@/app/actions/personal";
import { toast } from "sonner";
import { Plus, Loader2, UserPlus } from "lucide-react";

export function WorkerForm() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dni, setDni] = useState("");
    const [position, setPosition] = useState("FABRICACION");
    const [hireDate, setHireDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!firstName || !lastName || !dni || !position || !hireDate) {
                throw new Error("Todos los campos son obligatorios.");
            }

            await createWorker({
                firstName,
                lastName,
                dni,
                position,
                hireDate: new Date(hireDate)
            });

            toast.success("Operario Registrado", { description: "Se ha añadido al personal de la planta." });
            setOpen(false);

            // Reset form
            setFirstName("");
            setLastName("");
            setDni("");
            setPosition("FABRICACION");
        } catch (error: any) {
            toast.error("Error al registrar", { description: error.message || "Ocurrió un error inesperado." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm"><UserPlus className="w-4 h-4 mr-2" /> Nuevo Operario</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] border-slate-200 shadow-xl rounded-xl">
                <DialogHeader className="border-b pb-4 mb-4">
                    <DialogTitle className="text-xl font-semibold text-slate-800">Alta de Personal</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-600">Nombre</Label>
                            <Input value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="Ej: Juan" className="border-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600">Apellidos</Label>
                            <Input value={lastName} onChange={e => setLastName(e.target.value)} required placeholder="Ej: Pérez" className="border-slate-300" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-600">DNI / Documento</Label>
                        <Input value={dni} onChange={e => setDni(e.target.value)} required placeholder="Ej: 12345678X" className="border-slate-300" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-600">Puesto / Área</Label>
                        <Select value={position} onValueChange={setPosition} required>
                            <SelectTrigger className="border-slate-300">
                                <SelectValue placeholder="Seleccionar puesto" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FABRICACION">Fabricación (Planta)</SelectItem>
                                <SelectItem value="DESPACHO">Despacho y Carga</SelectItem>
                                <SelectItem value="BASCULA">Operador de Báscula</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-600">Fecha de Contratación</Label>
                        <Input type="date" value={hireDate} onChange={e => setHireDate(e.target.value)} required className="border-slate-300" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-300 shadow-sm">Cancelar</Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {loading ? "Guardando..." : "Registrar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
