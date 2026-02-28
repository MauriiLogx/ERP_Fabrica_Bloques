'use client';

import { signOut } from "next-auth/react";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UserMenu({ userName, userRole }: { userName: string, userRole: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-700">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    <UserIcon className="w-4 h-4" />
                </div>
                <div className="hidden sm:block">
                    <p className="font-semibold leading-none">{userName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{userRole}</p>
                </div>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
            >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
        </div>
    );
}
