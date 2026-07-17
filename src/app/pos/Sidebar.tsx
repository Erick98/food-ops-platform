"use client";

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Utensils, Target, LayoutDashboard, ShoppingCart, Users, Package, Settings, LogOut, MonitorPlay, Tag, FileText, Trash2, Wallet, Truck, BookOpen, LayoutGrid, ClipboardList, Receipt, ReceiptText, Calendar, ClipboardCheck, Bike } from 'lucide-react'
import Link from 'next/link'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/pos", icon: <ShoppingCart className="w-5 h-5" />, label: "Punto de Venta" },
    { href: "/pos/cash-register", icon: <Wallet className="w-5 h-5" />, label: "Turnos / Arqueo" },
    { href: "/pos/tables", icon: <LayoutGrid className="w-5 h-5" />, label: "Mesas y Zonas" },
    { href: "/pos/orders", icon: <ClipboardList className="w-5 h-5" />, label: "Órdenes" },
    { href: "/pos/kds", icon: <MonitorPlay className="w-5 h-5" />, label: "KDS (Cocina)" },
    { href: "/pos/goals", icon: <Target className="w-5 h-5" />, label: "Metas y KPIs" },
    { href: "/pos/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard" },
    { href: "/pos/inventory", icon: <Package className="w-5 h-5" />, label: "Inventario" },
    { href: "/pos/menu", icon: <FileText className="w-5 h-5" />, label: "Catálogo / Menú" },
    { href: "/pos/suppliers", icon: <Truck className="w-5 h-5" />, label: "Proveedores / OC" },
    { href: "/pos/recipes", icon: <BookOpen className="w-5 h-5" />, label: "Recetas (BOM)" },
    { href: "/pos/wastage", icon: <Trash2 className="w-5 h-5" />, label: "Mermas" },
    { href: "/pos/promotions", icon: <Tag className="w-5 h-5" />, label: "Promociones" },
    { href: "/pos/invoices", icon: <Receipt className="w-5 h-5" />, label: "Facturación" },
    { href: "/pos/delivery", icon: <Bike className="w-5 h-5" />, label: "Delivery (Apps)" },
    { href: "/pos/reports", icon: <FileText className="w-5 h-5" />, label: "Reportes & Sheets" },
    { href: "/pos/customers", icon: <Users className="w-5 h-5" />, label: "Clientes / CRM" },
    { href: "/pos/reservations", icon: <Calendar className="w-5 h-5" />, label: "Reservaciones" },
    { href: "/pos/staff", icon: <Users className="w-5 h-5" />, label: "Personal" },
    { href: "/pos/payroll", icon: <Wallet className="w-5 h-5" />, label: "Nómina" },
    { href: "/pos/expenses", icon: <ReceiptText className="w-5 h-5" />, label: "Gastos (OPEX)" },
    { href: "/pos/checklists", icon: <ClipboardCheck className="w-5 h-5" />, label: "Auditorías" },
    { href: "/pos/settings", icon: <Settings className="w-5 h-5" />, label: "Configuración" }
  ]

  return (
    <aside className="w-20 lg:w-64 bg-card border-r flex flex-col items-center lg:items-stretch py-4 shrink-0 shadow-sm z-10">
      <div className="flex items-center justify-center lg:justify-start lg:px-6 mb-6 gap-3 shrink-0">
        <div className="bg-primary text-primary-foreground p-2 rounded-lg shadow-sm">
          <Utensils className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg hidden lg:block tracking-tight">Food-Ops</span>
      </div>
      
      <div className="flex-1 overflow-y-auto w-full px-2 lg:px-4 scrollbar-thin scrollbar-thumb-muted-foreground/20">
        <nav className="space-y-1.5 pb-4">
          {navItems.map((item) => (
            <NavItem 
              key={item.href} 
              href={item.href} 
              icon={item.icon} 
              label={item.label} 
              active={pathname === item.href} 
            />
          ))}
        </nav>
      </div>

      <div className="px-2 lg:px-4 mt-4 pt-4 border-t shrink-0">
        <form action="/auth/signout" method="post">
          <button className="flex items-center justify-center lg:justify-start gap-3 w-full p-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors font-medium">
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block">Cerrar Sesión</span>
          </button>
        </form>
      </div>
    </aside>
  )
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: ReactNode; label: string; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center justify-center lg:justify-start gap-3 p-3 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-primary text-primary-foreground shadow-md' 
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      }`}
    >
      <div className="shrink-0">{icon}</div>
      <span className="hidden lg:block font-medium text-sm">{label}</span>
    </Link>
  )
}
