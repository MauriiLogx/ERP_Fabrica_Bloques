'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toggleWorkerStatus } from "@/app/actions/personal";
import { toast } from "sonner";
import { Loader2, Power, PowerOff } from "lucide-react";

export function ActiveToggle({ workerId, isActive }: { workerId: string, isActive: boolean }) {
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        try {
            await toggleWorkerStatus(workerId, isActive);
            toast.success(isActive ? "Operario Desactivado" : "Operario Activado");
        } catch (error: any) {
            toast.error("Error al actualizar estado", { description: error.message });
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
            <span className="ml-1.5 hidden sm:inline">{isActive ? 'Dar Baja' : 'Dar Alta'}</span>
        </Button>
    );
}
