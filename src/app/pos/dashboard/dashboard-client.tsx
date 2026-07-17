"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, DollarSign, Receipt, TrendingUp, AlertCircle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const salesData = [
  { time: '08:00', sales: 1200 },
  { time: '10:00', sales: 2500 },
  { time: '12:00', sales: 3800 },
  { time: '14:00', sales: 4500 },
  { time: '16:00', sales: 3200 },
  { time: '18:00', sales: 2800 },
  { time: '20:00', sales: 5100 },
  { time: '22:00', sales: 1500 },
]

const topProducts = [
  { name: 'Latte Vainilla', qty: 145 },
  { name: 'Americano', qty: 120 },
  { name: 'Cheesecake', qty: 85 },
  { name: 'Matcha Frío', qty: 76 },
  { name: 'Croissant', qty: 65 },
]

export default function DashboardClient({ metrics }: { metrics?: Record<string, unknown> | null }) {
  const displayMetrics = metrics || {
    totalSales: 24650.00,
    totalOrders: 156,
    avgTicket: 158.00,
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-muted/20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Operativo</h1>
        <p className="text-muted-foreground">Resumen financiero y operativo en tiempo real.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ventas Totales</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${Number(displayMetrics.totalSales || 0).toLocaleString()}</div>
            <p className="text-xs text-green-600 font-medium flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> +12.5% vs ayer
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Órdenes</CardTitle>
            <div className="p-2 bg-secondary rounded-full">
              <Receipt className="w-4 h-4 text-secondary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Number(displayMetrics.totalOrders || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              24 activas en este momento
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Promedio</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${Number(displayMetrics.avgTicket || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +5% vs semana pasada
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-destructive/20 bg-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Alertas de Inventario</CardTitle>
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertCircle className="w-4 h-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">3</div>
            <p className="text-xs text-destructive/80 mt-1">
              Insumos bajo el nivel mínimo
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Ventas por Hora</CardTitle>
            <CardDescription>Curva de transacciones del día actual</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Top Productos</CardTitle>
            <CardDescription>Los 5 más vendidos hoy</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="qty" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
