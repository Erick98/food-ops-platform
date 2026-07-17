import { ReactNode } from 'react'
import { Utensils, Target, LayoutDashboard, ShoppingCart, Users, Package, Settings, LogOut, MonitorPlay, Tag, FileText, Trash2, Wallet, Truck, BookOpen, LayoutGrid, ClipboardList, Receipt, ReceiptText, Calendar, ClipboardCheck, Bike } from 'lucide-react'
import Link from 'next/link'

export default function POSLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-white border-r flex flex-col items-center lg:items-stretch py-4">
        <div className="flex items-center justify-center lg:justify-start lg:px-6 mb-8 gap-3">
          <div className="bg-slate-900 text-white p-2 rounded-lg">
            <Utensils className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg hidden lg:block">Food-Ops</span>
        </div>
        
        <nav className="flex-1 space-y-2 px-2 lg:px-4">
          <NavItem href="/pos" icon={<ShoppingCart className="w-5 h-5" />} label="Punto de Venta" />
          <NavItem href="/pos/cash-register" icon={<Wallet className="w-5 h-5" />} label="Turnos / Arqueo" />
          <NavItem href="/pos/tables" icon={<LayoutGrid className="w-5 h-5" />} label="Mesas y Zonas" />
          <NavItem href="/pos/orders" icon={<ClipboardList className="w-5 h-5" />} label="Órdenes" />
          <NavItem href="/pos/kds" icon={<MonitorPlay className="w-5 h-5" />} label="KDS (Cocina)" />
          <NavItem href="/pos/goals" icon={<Target className="w-5 h-5" />} label="Metas y KPIs" />
          <NavItem href="/pos/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />
          <NavItem href="/pos/inventory" icon={<Package className="w-5 h-5" />} label="Inventario" />
          <NavItem href="/pos/menu" icon={<FileText className="w-5 h-5" />} label="Catálogo / Menú" />
          <NavItem href="/pos/suppliers" icon={<Truck className="w-5 h-5" />} label="Proveedores / OC" />
          <NavItem href="/pos/recipes" icon={<BookOpen className="w-5 h-5" />} label="Recetas (BOM)" />
          <NavItem href="/pos/wastage" icon={<Trash2 className="w-5 h-5" />} label="Mermas" />
          <NavItem href="/pos/promotions" icon={<Tag className="w-5 h-5" />} label="Promociones" />
          <NavItem href="/pos/invoices" icon={<Receipt className="w-5 h-5" />} label="Facturación" />
          <NavItem href="/pos/delivery" icon={<Bike className="w-5 h-5" />} label="Delivery (Apps)" />
          <NavItem href="/pos/reports" icon={<FileText className="w-5 h-5" />} label="Reportes & Sheets" />
          <NavItem href="/pos/customers" icon={<Users className="w-5 h-5" />} label="Clientes / CRM" />
          <NavItem href="/pos/reservations" icon={<Calendar className="w-5 h-5" />} label="Reservaciones" />
          <NavItem href="/pos/staff" icon={<Users className="w-5 h-5" />} label="Personal" />
          <NavItem href="/pos/payroll" icon={<Wallet className="w-5 h-5" />} label="Nómina y Asistencia" />
          <NavItem href="/pos/expenses" icon={<ReceiptText className="w-5 h-5" />} label="Gastos (OPEX)" />
          <NavItem href="/pos/checklists" icon={<ClipboardCheck className="w-5 h-5" />} label="Checklists / Auditorías" />
          <NavItem href="/pos/settings" icon={<Settings className="w-5 h-5" />} label="Configuración" />
        </nav>

        <div className="px-2 lg:px-4 mt-auto">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="hidden lg:block font-medium">Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${active ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
      {icon}
      <span className="hidden lg:block font-medium">{label}</span>
    </Link>
  )
}
