'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

export type DashboardMetrics = {
  ventasHoy: number
  ventasAyer: number
  ordenesHoy: number
  clientesHoy: number
  mermasHoy: number
  ticketPromedio: number
  ventasPorHora: { hora: string; ventas: number }[]
  topProductos: { name: string; cantidad: number; total: number }[]
}

function pct(a: number, b: number) {
  if (b === 0) return 0
  return Math.round(((a - b) / b) * 100)
}

export function DashboardClient({ metrics }: { metrics: DashboardMetrics }) {
  const ventasDelta = pct(metrics.ventasHoy, metrics.ventasAyer)
  const isPositive = ventasDelta >= 0

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 overflow-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard de Sucursal</h1>
        <p className="text-slate-500 text-sm">Métricas del día — Ito Café</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Ventas Hoy</CardTitle>
            {isPositive
              ? <TrendingUp className="w-4 h-4 text-green-500" />
              : <TrendingDown className="w-4 h-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.ventasHoy.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
            <p className={`text-xs flex items-center mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {isPositive ? '+' : ''}{ventasDelta}% vs ayer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Órdenes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.ordenesHoy}</div>
            <p className="text-xs text-slate-500 mt-1">
              Ticket Promedio: ${metrics.ticketPromedio.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Clientes Atendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.clientesHoy}</div>
            <p className="text-xs text-slate-500 mt-1">Ratio Orden/Cliente: {metrics.ordenesHoy > 0 ? (metrics.ordenesHoy / metrics.clientesHoy).toFixed(2) : '—'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Mermas (Valor)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">${metrics.mermasHoy.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">
              {metrics.ventasHoy > 0 ? ((metrics.mermasHoy / metrics.ventasHoy) * 100).toFixed(1) : 0}% de ventas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart — Ventas por Hora */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ventas por Hora (MXN)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.ventasPorHora}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hora" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Ventas']} />
                <Line type="monotone" dataKey="ventas" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart — Top Productos */}
        <Card>
          <CardHeader>
            <CardTitle>Top Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {metrics.topProductos.slice(0, 4).map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.cantidad} vendidos</div>
                  </div>
                  <div className="font-bold text-sm">${p.total.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.topProductos.slice(0, 4)} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} width={80} />
                  <Bar dataKey="total" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
