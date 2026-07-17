'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Target, TrendingUp, DollarSign, ShoppingCart, Plus, Save } from 'lucide-react'

type Goal = {
  id: string
  period_start: string
  period_end: string
  target_sales: number
  current_sales: number
  target_orders: number
  current_orders: number
  target_ticket_average: number
  current_ticket_average: number
}

// Mock data para UI
const MOCK_GOALS: Goal[] = [
  {
    id: '1',
    period_start: '2026-07-01',
    period_end: '2026-07-31',
    target_sales: 350000,
    current_sales: 185400,
    target_orders: 4000,
    current_orders: 2150,
    target_ticket_average: 90,
    current_ticket_average: 86.2,
  }
]

export function GoalsClient() {
  const [goals] = useState<Goal[]>(MOCK_GOALS)
  const [showForm, setShowForm] = useState(false)
  
  const currentGoal = goals[0] // Para el mes actual
  
  const salesProgress = Math.min((currentGoal.current_sales / currentGoal.target_sales) * 100, 100)
  const ordersProgress = Math.min((currentGoal.current_orders / currentGoal.target_orders) * 100, 100)
  
  const fmt = (n: number) => n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  
  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 overflow-auto space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Metas y KPIs</h1>
          <p className="text-slate-500 text-sm">Define y monitorea los objetivos comerciales de la sucursal.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Meta
        </Button>
      </header>

      {showForm && (
        <Card className="border-indigo-100 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Configurar Nueva Meta Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Inicio del Período</Label>
                <Input type="date" defaultValue="2026-08-01" />
              </div>
              <div className="space-y-2">
                <Label>Fin del Período</Label>
                <Input type="date" defaultValue="2026-08-31" />
              </div>
              <div className="space-y-2">
                <Label>Meta de Ventas ($)</Label>
                <Input type="number" defaultValue={400000} />
              </div>
              <div className="space-y-2">
                <Label>Meta de Órdenes</Label>
                <Input type="number" defaultValue={4500} />
              </div>
              <div className="space-y-2">
                <Label>Ticket Promedio Deseado ($)</Label>
                <Input type="number" defaultValue={95} />
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowForm(false)}>
                  <Save className="mr-2 h-4 w-4" /> Guardar Meta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main KPI tracking */}
      <h2 className="text-lg font-semibold mt-4">Progreso del Mes Actual (Julio 2026)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Ventas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-slate-700 text-base">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" /> Meta de Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end mb-2">
              <div className="text-2xl font-bold text-slate-800">${fmt(currentGoal.current_sales)}</div>
              <div className="text-sm font-medium text-slate-500">Objetivo: ${fmt(currentGoal.target_sales)}</div>
            </div>
            <Progress value={salesProgress} className="h-2 mb-2 bg-slate-100 [&>div]:bg-green-600" />
            <p className="text-xs text-slate-500 text-right">{salesProgress.toFixed(1)}% completado</p>
          </CardContent>
        </Card>

        {/* Ordenes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-slate-700 text-base">
              <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" /> Meta de Órdenes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end mb-2">
              <div className="text-2xl font-bold text-slate-800">{currentGoal.current_orders}</div>
              <div className="text-sm font-medium text-slate-500">Objetivo: {currentGoal.target_orders}</div>
            </div>
            <Progress value={ordersProgress} className="h-2 mb-2 bg-slate-100 [&>div]:bg-blue-600" />
            <p className="text-xs text-slate-500 text-right">{ordersProgress.toFixed(1)}% completado</p>
          </CardContent>
        </Card>

        {/* Ticket Promedio */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-slate-700 text-base">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-600" /> Ticket Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="text-2xl font-bold text-slate-800">${fmt(currentGoal.current_ticket_average)}</div>
              <Badge variant={currentGoal.current_ticket_average >= currentGoal.target_ticket_average ? 'default' : 'secondary'} 
                     className={currentGoal.current_ticket_average >= currentGoal.target_ticket_average ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                Objetivo: ${fmt(currentGoal.target_ticket_average)}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              {currentGoal.current_ticket_average >= currentGoal.target_ticket_average 
                ? '¡Excelente! Estás por encima del objetivo.' 
                : 'Falta sugerir postres o bebidas extra para subir el ticket.'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Historial o Sugerencias */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Target className="w-5 h-5 mr-2 text-indigo-600" /> Recomendaciones de Food-Ops
          </CardTitle>
          <CardDescription>Para alcanzar tus metas este mes, considera las siguientes acciones:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-md">
            <strong>📈 Aumentar Ticket Promedio:</strong> Implementa el combo &quot;Bebida + Postre por $49&quot; al momento de cobrar. Actualmente el ticket promedio está $3.80 por debajo de la meta.
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-md">
            <strong>🚀 Volúmen de Órdenes:</strong> Estás al 53.8% del objetivo y vamos a mitad de mes. Buen ritmo, considera lanzar campaña en IG para el fin de semana para mantener la tracción.
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
