'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createOrder } from "@/app/actions/ventas";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, ShoppingBag } from "lucide-react";

export function OrderForm({ clients, blockTypes, userId }: { clients: any[], blockTypes: any[], userId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [clientId, setClientId] = useState(clients.length > 0 ? clients[0].id : "");
    const [lines, setLines] = useState([{ blockTypeId: "", quantity: 0, unitPrice: 0 }]);

    const addLine = () => setLines([...lines, { blockTypeId: "", quantity: 0, unitPrice: 0 }]);
    const removeLine = (index: number) => setLines(lines.filter((_, i) => i !== index));

    const updateLine = (index: number, field: string, value: any) => {
        const newLines = [...lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setLines(newLines);
    };

    const calculateTotal = () => {
        return lines.reduce((acc, l) => acc + (l.quantity * l.unitPrice), 0).toFixed(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!clientId) throw new Error("Debe seleccionar un cliente.");
            if (lines.length === 0) throw new Error("Agregue al menos un tipo de bloque al pedido.");
            if (lines.some(l => !l.blockTypeId || l.quantity <= 0 || l.unitPrice < 0)) {
                throw new Error("Verifique las cantidades y precios unitarios. Mínimo 1 und.");
            }

            await createOrder({
                date: new Date(date),
                clientId,
                createdById: userId,
                lines
            });

            toast.success("Pedido Creado", { description: "El pedido está en estado PENDIENTE." });
            setOpen(false);
            setLines([{ blockTypeId: "", quantity: 0, unitPrice: 0 }]);
        } catch (error: any) {
            toast.error("Error al registrar", { description: error.message || "Ocurrió un error inesperado." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm"><ShoppingBag className="w-4 h-4 mr-2" /> Crear Pedido</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] border-slate-200 shadow-xl rounded-xl">
                <DialogHeader className="border-b pb-4 mb-4">
                    <DialogTitle className="text-xl font-semibold text-slate-800">Nuevo Pedido de Venta</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-600">Fecha</Label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="border-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600">Cliente</Label>
                            <Select value={clientId} onValueChange={setClientId} required disabled={clients.length === 0}>
                                <SelectTrigger className="border-slate-300">
                                    <SelectValue placeholder={clients.length === 0 ? "Sin clientes registrados" : "Seleccionar cliente"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <Label className="text-slate-700 font-semibold">Líneas de Pedido</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addLine} className="h-8 border-slate-300 bg-white shadow-sm">
                                <Plus className="w-4 h-4 mr-1" /> Añadir Bloque
                            </Button>
                        </div>

                        {lines.map((l, index) => (
                            <div key={index} className="flex gap-2 items-end">
                                <div className="flex-1 space-y-1">
                                    <Label className="text-xs text-slate-500">Tipo Bloque</Label>
                                    <Select value={l.blockTypeId} onValueChange={(val) => updateLine(index, 'blockTypeId', val)}>
                                        <SelectTrigger className="bg-white border-slate-300">
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {blockTypes.map((bt: any) => (
                                                <SelectItem key={bt.id} value={bt.id}>{bt.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-24 space-y-1">
                                    <Label className="text-xs text-slate-500">Cantidad</Label>
                                    <Input
                                        type="number" min="1" value={l.quantity || ''}
                                        onChange={e => updateLine(index, 'quantity', parseInt(e.target.value) || 0)}
                                        className="bg-white border-slate-300"
                                    />
                                </div>
                                <div className="w-32 space-y-1">
                                    <Label className="text-xs text-slate-500">Precio Unit. ($)</Label>
                                    <Input
                                        type="number" step="0.01" min="0" value={l.unitPrice || ''}
                                        onChange={e => updateLine(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                        className="bg-white border-slate-300"
                                    />
                                </div>
                                <div className="w-24 pb-2 text-right text-sm font-medium text-slate-700">
                                    ${(l.quantity * l.unitPrice).toFixed(2)}
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="mb-0.5 text-red-500 hover:bg-red-50" onClick={() => removeLine(index)} disabled={lines.length === 1}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <div className="text-slate-500 text-sm">Total a facturar:</div>
                        <div className="text-2xl font-bold text-slate-900">${calculateTotal()}</div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-300 shadow-sm">Cancelar</Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {loading ? "Generando..." : "Crear Pedido"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
