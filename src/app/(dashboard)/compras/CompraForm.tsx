'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPurchase } from "@/app/actions/compras";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

export function CompraForm({ suppliers, materials }: { suppliers: any[], materials: any[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [supplierId, setSupplierId] = useState(suppliers.length > 0 ? suppliers[0].id : "");
    const [materialId, setMaterialId] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unitPrice, setUnitPrice] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!materialId || !supplierId) throw new Error("Debe seleccionar proveedor y material.");
            if (Number(quantity) <= 0) throw new Error("La cantidad debe ser mayor a 0.");
            if (Number(unitPrice) <= 0) throw new Error("El precio unitario debe ser válido.");

            await createPurchase({
                date: new Date(date),
                supplierId,
                materialId,
                invoiceNumber,
                quantity: Number(quantity),
                unitPrice: Number(unitPrice),
            });

            toast.success("Compra registrada", { description: "Se ha actualizado el stock y coste medio." });
            setOpen(false);

            // Reset
            setMaterialId("");
            setInvoiceNumber("");
            setQuantity("");
            setUnitPrice("");
        } catch (error: any) {
            toast.error("Error al registrar", { description: error.message || "Ocurrió un error." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm"><Plus className="w-4 h-4 mr-2" /> Registrar Compra</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] border-slate-200 shadow-xl rounded-xl">
                <DialogHeader className="border-b pb-4 mb-4">
                    <DialogTitle className="text-xl font-semibold text-slate-800">Nueva Compra</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-600">Fecha</Label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="border-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600">Factura / Albarán</Label>
                            <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="Ej: F-1024" className="border-slate-300" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-600">Proveedor</Label>
                        <Select value={supplierId} onValueChange={setSupplierId} required disabled={suppliers.length === 0}>
                            <SelectTrigger className="border-slate-300">
                                <SelectValue placeholder={suppliers.length === 0 ? "No hay proveedores" : "Seleccionar proveedor"} />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map((s: any) => (
                                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.cif})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-600">Materia Prima</Label>
                        <Select value={materialId} onValueChange={setMaterialId} required>
                            <SelectTrigger className="border-slate-300">
                                <SelectValue placeholder="Seleccionar material" />
                            </SelectTrigger>
                            <SelectContent>
                                {materials.map((m: any) => (
                                    <SelectItem key={m.id} value={m.id}>{m.name} ({m.unit})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-600">Cantidad</Label>
                            <Input type="number" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} required placeholder="0.00" className="border-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600">Precio Unitario ($)</Label>
                            <Input type="number" step="0.0001" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} required placeholder="0.0000" className="border-slate-300" />
                        </div>
                    </div>

                    <div className="bg-blue-50/50 p-3 rounded-md text-sm text-slate-700 font-medium text-right border border-blue-100">
                        Total estimado: ${(Number(quantity) * Number(unitPrice)).toFixed(2)}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-300 shadow-sm">Cancelar</Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {loading ? "Guardando..." : "Registrar Compra"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
