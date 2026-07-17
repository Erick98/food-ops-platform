'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { Order, OrderStatus } from './actions'
import { updateOrderStatus } from './actions'
import {
  Clock, ChefHat, CheckCircle, XCircle, Package,
  Filter, RefreshCw, MapPin, User, CreditCard, Banknote
} from 'lucide-react'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  pending:    { label: 'Pendiente',   color: 'text-amber-700',  bgColor: 'bg-amber-50 border-amber-200',  icon: <Clock className="w-4 h-4" /> },
  preparing:  { label: 'Preparando', color: 'text-blue-700',   bgColor: 'bg-blue-50 border-blue-200',    icon: <ChefHat className="w-4 h-4" /> },
  ready:      { label: 'Listo',      color: 'text-green-700',  bgColor: 'bg-green-50 border-green-200',  icon: <CheckCircle className="w-4 h-4" /> },
  closed:     { label: 'Cerrado',    color: 'text-slate-600',  bgColor: 'bg-slate-50 border-slate-200',  icon: <Package className="w-4 h-4" /> },
  cancelled:  { label: 'Cancelado',  color: 'text-red-700',    bgColor: 'bg-red-50 border-red-200',      icon: <XCircle className="w-4 h-4" /> },
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:   'preparing',
  preparing: 'ready',
  ready:     'closed',
}

const NEXT_STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  pending:   '▶ Iniciar Preparación',
  preparing: '✓ Marcar Listo',
  ready:     '✅ Cerrar / Cobrado',
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'Ahora mismo'
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}min`
}

function PaymentIcon({ method }: { method: string }) {
  return method === 'cash'
    ? <Banknote className="w-3.5 h-3.5 text-green-600" />
    : <CreditCard className="w-3.5 h-3.5 text-blue-600" />
}

interface OrderCardProps {
  order: Order
  onStatusChange: (id: string, status: OrderStatus) => void
  isPending: boolean
}

function OrderCard({ order, onStatusChange, isPending }: OrderCardProps) {
  const cfg = STATUS_CONFIG[order.status]
  const nextStatus = NEXT_STATUS[order.status]
  const nextLabel = NEXT_STATUS_LABEL[order.status]

  return (
    <Card className={`border ${cfg.bgColor} transition-all`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${cfg.color} border-current font-mono text-xs`}>
                #{order.id.slice(-6).toUpperCase()}
              </Badge>
              <span className={`flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
                {cfg.icon} {cfg.label}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeAgo(order.created_at)}
              </span>
              {order.tables && (
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <MapPin className="w-3 h-3" /> {order.tables.name} — {order.tables.zone}
                </span>
              )}
              {!order.tables && (
                <span className="flex items-center gap-1">🛵 Para llevar</span>
              )}
              {order.profiles?.full_name && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" /> {order.profiles.full_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <PaymentIcon method={order.payment_method} />
                {order.payment_method === 'cash' ? 'Efectivo' : 'Tarjeta'}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-slate-900">
              ${order.total_amount.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500">{order.order_items.length} producto(s)</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Items list */}
        <ul className="divide-y divide-slate-100 mb-3">
          {order.order_items.map(item => (
            <li key={item.id} className="py-1 flex justify-between text-sm">
              <span className="flex gap-2">
                <span className="font-medium text-slate-800">×{item.quantity}</span>
                <span className="text-slate-700">{item.products?.name ?? 'Producto'}</span>
                {item.notes && <span className="text-slate-400 italic">({item.notes})</span>}
              </span>
              <span className="text-slate-600">${item.subtotal.toFixed(2)}</span>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          {nextStatus && nextLabel && (
            <Button
              size="sm"
              className="flex-1"
              disabled={isPending}
              onClick={() => onStatusChange(order.id, nextStatus)}
            >
              {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : nextLabel}
            </Button>
          )}
          {order.status !== 'cancelled' && order.status !== 'closed' && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              disabled={isPending}
              onClick={() => onStatusChange(order.id, 'cancelled')}
            >
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface DailySummary {
  totalSales: number
  orderCount: number
  avgTicket: number
  byStatus: Record<OrderStatus, number>
}

interface OrdersClientProps {
  orders: Order[]
  summary: DailySummary
}

const STATUS_FILTERS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'preparing', label: 'Preparando' },
  { key: 'ready', label: 'Listas' },
  { key: 'closed', label: 'Cerradas' },
  { key: 'cancelled', label: 'Canceladas' },
]

export function OrdersClient({ orders: initialOrders, summary }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus)
      if (res.success) {
        setOrders(prev =>
          prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
        )
      }
    })
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const activeCount = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Órdenes del Día</h1>
            <p className="text-sm text-slate-500">
              {activeCount > 0
                ? `${activeCount} orden${activeCount > 1 ? 'es' : ''} activa${activeCount > 1 ? 's' : ''}`
                : 'Sin órdenes activas'}
            </p>
          </div>
          {/* Summary cards */}
          <div className="flex gap-3">
            <div className="bg-slate-50 border rounded-lg px-4 py-2 text-center">
              <p className="text-xs text-slate-500">Ventas hoy</p>
              <p className="text-lg font-bold text-slate-900">${summary.totalSales.toFixed(0)}</p>
            </div>
            <div className="bg-slate-50 border rounded-lg px-4 py-2 text-center">
              <p className="text-xs text-slate-500">Órdenes</p>
              <p className="text-lg font-bold text-slate-900">{summary.orderCount}</p>
            </div>
            <div className="bg-slate-50 border rounded-lg px-4 py-2 text-center">
              <p className="text-xs text-slate-500">Ticket prom.</p>
              <p className="text-lg font-bold text-slate-900">${summary.avgTicket.toFixed(0)}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400 self-center" />
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filter === f.key
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {f.label}
              {f.key !== 'all' && (
                <span className="ml-1 opacity-70">
                  ({orders.filter(o => o.status === f.key).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders grid */}
      <div className="flex-1 overflow-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Package className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">No hay órdenes {filter !== 'all' ? `con estado "${STATUS_CONFIG[filter as OrderStatus]?.label}"` : ''}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                isPending={isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
