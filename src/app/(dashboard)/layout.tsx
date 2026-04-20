import Link from "next/link";
import { Factory, Package, Users, BarChart3, Settings, Truck } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { UserMenu } from "@/components/UserMenu";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 flex flex-col bg-white border-r border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-100">
                    <h1 className="text-xl font-bold flex items-center gap-2 text-blue-700">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Factory className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-slate-800 tracking-tight">Fábrica ERP</span>
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-md text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                        <BarChart3 className="h-5 w-5 opacity-70" /> Resumen
                    </Link>
                    <Link href="/produccion" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-md text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                        <Factory className="h-5 w-5 opacity-70" /> Producción
                    </Link>
                    <Link href="/ventas" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-md text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                        <Truck className="h-5 w-5 opacity-70" /> Ventas y Pedidos
                    </Link>
                    <Link href="/stock" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-md text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                        <Package className="h-5 w-5 opacity-70" /> Stock Terminado
                    </Link>
                    <Link href="/personal" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-md text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                        <Users className="h-5 w-5 opacity-70" /> Personal
                    </Link>

                    <div className="pt-6 mt-4 border-t border-slate-100">
                        <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Administración</p>
                        <Link href="/configuracion" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-md text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                            <Settings className="h-5 w-5 opacity-70" /> Configuración
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 shadow-sm">
                    {session?.user && (
                        <UserMenu userName={session.user.name || 'Usuario'} userRole={session.user.role || 'Admin'} />
                    )}
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
            <Toaster />
        </div>
    );
}
