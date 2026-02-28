import Link from "next/link";
import { Factory, ShoppingCart, Truck, Package, Users, BarChart3, Settings } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { UserMenu } from "@/components/UserMenu";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    return (
        <div className="flex min-h-screen bg-gray-50/40">
            {/* Sidebar */}
            <aside className="w-64 flex flex-col bg-white border-r">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold flex items-center gap-2 text-primary">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Factory className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-slate-800 tracking-tight">ERP Nexus</span>
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors">
                        <BarChart3 className="h-5 w-5 text-slate-400" /> Dashboard
                    </Link>
                    <Link href="/produccion" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors">
                        <Factory className="h-5 w-5 text-slate-400" /> Producción
                    </Link>
                    <Link href="/compras" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors">
                        <ShoppingCart className="h-5 w-5 text-slate-400" /> Compras
                    </Link>
                    <Link href="/ventas" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors">
                        <Truck className="h-5 w-5 text-slate-400" /> Venta y Despacho
                    </Link>
                    <Link href="/stock" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors">
                        <Package className="h-5 w-5 text-slate-400" /> Inventario Patio
                    </Link>
                    <Link href="/personal" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors">
                        <Users className="h-5 w-5 text-slate-400" /> Personal
                    </Link>

                    <div className="pt-4 mt-2 border-t border-slate-100">
                        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Administración</p>
                        <Link href="/configuracion" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors">
                            <Settings className="h-5 w-5 text-slate-400" /> Configuración General
                        </Link>
                    </div>
                </nav>
                <div className="p-4 border-t text-sm text-gray-500 text-center">
                    Versión 1.0 (MVP)
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b flex items-center justify-end px-8 shadow-sm">
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
