'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toggleBlockTypeActive } from "@/app/actions/configuracion";
import { toast } from "sonner";
import { Loader2, Power, PowerOff } from "lucide-react";

export function BlockToggle({ blockId, isActive }: { blockId: string, isActive: boolean }) {
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        try {
            await toggleBlockTypeActive(blockId, isActive);
            toast.success(isActive ? "Molde Desactivado" : "Molde Activado");
        } catch (error: any) {
            toast.error("Error al actualizar", { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            disabled={loading}
            className={`h-8 ${isActive ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}
        >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
                isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />
            )}
            <span className="ml-1.5 hidden sm:inline">{isActive ? 'Desactivar Molde' : 'Reactivar'}</span>
        </Button>
    );
}
