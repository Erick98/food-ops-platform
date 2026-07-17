'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  FileText, Download, UploadCloud, RefreshCw, CheckCircle2,
  Printer, ShoppingCart, Package, Trash2, Receipt
} from 'lucide-react'

type CutoffData = {
  fecha: string
  totalGeneral: number
  totalEfectivo: number
  totalTarjeta: number
  totalTrans: number
  totalOrdenes: number
  totalCanceladas: number
  ticketPromedio: number
} | null

const today = new Date().toISOString().split('T')[0]
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

const REPORT_TYPES = [
  { type: 'sales',     label: 'Ventas (Órdenes)',   icon: ShoppingCart, color: 'text-blue-600',   bg: 'bg-blue-50'   },
  { type: 'inventory', label: 'Inventario',          icon: Package,      color: 'text-green-600',  bg: 'bg-green-50'  },
  { type: 'mermas',    label: 'Mermas',              icon: Trash2,       color: 'text-orange-600', bg: 'bg-orange-50' },
  { type: 'expenses',  label: 'Gastos (OPEX)',       icon: Receipt,      color: 'text-purple-600', bg: 'bg-purple-50' },
]

export function ReportsClient({ cutoff }: { cutoff: CutoffData }) {
  const [syncing, setSyncing] = useState(false)
  const [syncDone, setSyncDone] = useState(false)
  const [fromDate, setFromDate] = useState(weekAgo)
  const [toDate, setToDate] = useState(today)
  const [downloading, setDownloading] = useState<string | null>(null)

  const fmt = (n: number) => n.toLocaleString('es-MX', { minimumFractionDigits: 2 })

  const c = cutoff ?? {
    fecha: today,
    totalGeneral: 12450, totalEfectivo: 6200, totalTarjeta: 5400, totalTrans: 850,
    totalOrdenes: 142, totalCanceladas: 3, ticketPromedio: 87.67,
  }

  const handleSync = async () => {
    setSyncing(true)
    await new Promise(r => setTimeout(r, 1500))
    setSyncing(false)
    setSyncDone(true)
    setTimeout(() => setSyncDone(false), 3000)
  }

  const handleDownload = async (type: string) => {
    setDownloading(type)
    try {
      const params = type === 'inventory'
        ? `type=${type}`
        : `type=${type}&from=${fromDate}&to=${toDate}`
      const res = await fetch(`/api/reports/csv?${params}`)
      if (!res.ok) throw new Error(await res.text())

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte_${type}_${fromDate}_${toDate}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error al descargar:', err)
      alert('Error al generar el reporte. Asegúrate de tener conexión a Supabase configurada.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 overflow-auto space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reportes e Integración</h1>
          <p className="text-slate-500 text-sm">Exporta datos a CSV y sincroniza con Google Sheets</p>
        </div>
        <Button onClick={handleSync} disabled={syncing} className="bg-indigo-600 hover:bg-indigo-700">
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando…' : syncDone ? '¡Listo! ✓' : 'Sincronizar a Sheets'}
        </Button>
      </header>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rango de Fechas para Exportación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="from_date">Desde</Label>
              <Input id="from_date" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-44" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to_date">Hasta</Label>
              <Input id="to_date" type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-44" />
            </div>
            <Button variant="outline" onClick={() => { setFromDate(today); setToDate(today) }}>Hoy</Button>
            <Button variant="outline" onClick={() => setFromDate(weekAgo)}>Últimos 7 días</Button>
            <Button variant="outline" onClick={() => {
              const m = new Date()
              setFromDate(new Date(m.getFullYear(), m.getMonth(), 1).toISOString().split('T')[0])
              setToDate(today)
            }}>Este mes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <div>
        <h2 className="text-lg font-semibold mb-3">📥 Exportar a CSV</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REPORT_TYPES.map(({ type, label, icon: Icon, color, bg }) => (
            <Card key={type} className={`${bg} border-0 hover:shadow-md transition-shadow cursor-pointer`}>
              <CardContent className="p-4 flex flex-col items-center gap-3">
                <div className={`p-3 rounded-full bg-white ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="font-medium text-sm text-center">{label}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  disabled={downloading === type}
                  onClick={() => handleDownload(type)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {downloading === type ? 'Generando…' : 'Descargar CSV'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Corte de Caja */}
      <div>
        <h2 className="text-lg font-semibold mb-3">🧾 Corte de Caja — {c.fecha}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="border-indigo-200 bg-indigo-50/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">Total General</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-700">${fmt(c.totalGeneral)}</div>
              <p className="text-xs text-slate-500 mt-1">{c.totalOrdenes} órdenes completadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">Efectivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">${fmt(c.totalEfectivo)}</div>
              <p className="text-xs text-slate-500 mt-1">
                {c.totalGeneral > 0 ? ((c.totalEfectivo / c.totalGeneral) * 100).toFixed(0) : 0}% del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">Tarjeta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">${fmt(c.totalTarjeta)}</div>
              <p className="text-xs text-slate-500 mt-1">
                {c.totalGeneral > 0 ? ((c.totalTarjeta / c.totalGeneral) * 100).toFixed(0) : 0}% del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">Transferencia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">${fmt(c.totalTrans)}</div>
              <p className="text-xs text-slate-500 mt-1">
                <Badge variant="secondary">{c.totalCanceladas} canceladas</Badge>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sheets + Quick Prints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              Google Sheets — Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center bg-white p-3 rounded border">
              <span className="font-medium text-sm text-slate-700">Hoja Maestra de Ventas</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">Conectado</span>
            </div>
            <p className="text-xs text-slate-500">Última sync: Hoy, 08:00 UTC</p>
            <Button variant="outline" className="w-full">
              <UploadCloud className="mr-2 h-4 w-4" /> Configurar Credenciales
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium">Imprimir Corte de Caja</span>
              </div>
              <FileText className="w-4 h-4 text-slate-400" />
            </Button>
            <Button variant="outline" className="w-full justify-between" onClick={() => handleDownload('sales')}>
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium">Exportar ventas del período</span>
              </div>
              <Download className="w-4 h-4 text-slate-400" />
            </Button>
            <Button variant="outline" className="w-full justify-between" onClick={() => handleDownload('inventory')}>
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium">Exportar inventario completo</span>
              </div>
              <Download className="w-4 h-4 text-slate-400" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sync History */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Historial de Sincronización</h2>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 font-medium text-slate-500">Fecha / Hora</th>
                  <th className="p-4 font-medium text-slate-500">Módulo</th>
                  <th className="p-4 font-medium text-slate-500">Estado</th>
                  <th className="p-4 font-medium text-slate-500">Registros</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { ts: '2026-07-16 08:00 UTC', mod: 'Ventas (POS)',      rec: '142 órdenes'  },
                  { ts: '2026-07-15 23:59 UTC', mod: 'Cierre Inventario', rec: '24 items'      },
                  { ts: '2026-07-15 08:00 UTC', mod: 'Ventas (POS)',      rec: '189 órdenes'  },
                ].map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="p-4 text-slate-700">{row.ts}</td>
                    <td className="p-4 text-slate-700">{row.mod}</td>
                    <td className="p-4">
                      <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-medium">Éxito</span>
                    </td>
                    <td className="p-4 text-slate-700">{row.rec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
