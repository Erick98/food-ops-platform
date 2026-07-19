export const dynamic = 'force-dynamic'
/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link"
import { Building2, TrendingUp, Store, ChevronRight, BrainCircuit } from "lucide-react"
import { getHoldingMetrics } from "./actions"

export default async function HoldingDashboard() {
  const metrics = await getHoldingMetrics()

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Topbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Bernav Capital</h1>
            <p className="text-sm text-muted-foreground">Centro de Mando Corporativo</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
            <BrainCircuit className="w-4 h-4" />
            AI Copilot Insights
          </button>
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center border">
            <span className="font-bold text-sm">EB</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 lg:p-10 space-y-8">
        {/* KPI Cards Globales */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Métricas Globales (Hoy)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col gap-2">
              <span className="text-sm text-muted-foreground font-medium">Ventas Totales</span>
              <span className="text-3xl font-bold">${metrics.globalSales.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Tiempo real
              </span>
            </div>
            <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col gap-2">
              <span className="text-sm text-muted-foreground font-medium">Órdenes Totales</span>
              <span className="text-3xl font-bold">{metrics.globalOrdersCount}</span>
              <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Tiempo real
              </span>
            </div>
            <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col gap-2">
              <span className="text-sm text-muted-foreground font-medium">Ticket Promedio Global</span>
              <span className="text-3xl font-bold">${metrics.ticketPromedio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </section>

        {/* Restaurantes (Tenants) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tus Restaurantes</h2>
            <button className="text-sm text-primary hover:underline font-medium">
              + Agregar Nueva Marca
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.tenants.map((tenant: any) => (
              <Link key={tenant.id} href={`/pos?tenant=${tenant.id}`} className="group">
                <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${tenant.id === 'ito-cafe' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                        <Store className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{tenant.name}</h3>
                        <p className="text-xs text-muted-foreground">{tenant.status} • {tenant.location}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="mt-auto pt-4 border-t grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Ventas Hoy</p>
                      <p className="font-semibold">${tenant.salesToday.toLocaleString('es-MX')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Alertas AI</p>
                      <p className={`font-semibold ${tenant.lowStockItems.length > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                        {tenant.lowStockItems.length > 0 ? `${tenant.lowStockItems.length} de Inventario` : 'Todo en orden'}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* AI Copilot Insights Preview */}
        <section className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300">Insights de IA para ti</h2>
          </div>
          <div className="space-y-3">
            {metrics.aiInsights.map((insight: any, i: number) => (
              <div key={i} className="bg-white dark:bg-card p-4 rounded-lg shadow-sm border border-blue-50 dark:border-blue-900/50 text-sm">
                <span className="font-semibold">{insight.tenantName}:</span> {insight.message}
                {insight.action && (
                  <button className="text-blue-600 font-medium hover:underline ml-2">{insight.action}</button>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
