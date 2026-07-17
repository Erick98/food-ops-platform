'use client'

import { useState, useEffect } from 'react'
import { updateOrderStatus, getActiveOrders } from '../actions'
import { createClient } from '@/utils/supabase/client'

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'

// Using any to handle the joined table type flexibly
interface DBOrder {
  id: string
  status: string
  created_at: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order_items: any[]
}

interface OrderItem {
  id: string
  name: string
  quantity: number
  notes?: string
}

interface Order {
  id: string
  ticketNumber: string
  status: OrderStatus
  items: OrderItem[]
  timeElapsed: number
  createdAt: string
}

function parseDBOrders(dbOrders: DBOrder[]): Order[] {
  return dbOrders.map(dbO => {
    const elapsedMinutes = Math.floor((new Date().getTime() - new Date(dbO.created_at).getTime()) / 60000)
    return {
      id: dbO.id,
      ticketNumber: dbO.id.split('-')[0].substring(0, 5).toUpperCase(), // Mock ticket from ID
      status: dbO.status as OrderStatus,
      createdAt: dbO.created_at,
      timeElapsed: elapsedMinutes > 0 ? elapsedMinutes : 0,
      items: dbO.order_items.map((item, idx) => {
        let name = 'Desconocido'
        if (item.products) {
          name = Array.isArray(item.products) ? item.products[0]?.name : item.products?.name
        }
        return {
          id: `${dbO.id}-${idx}`,
          name: name || 'Producto',
          quantity: item.quantity,
          notes: item.notes
        }
      })
    }
  })
}

export default function KDSClient({ initialActiveOrders }: { initialActiveOrders: DBOrder[] }) {
  const [orders, setOrders] = useState<Order[]>(parseDBOrders(initialActiveOrders))
  const supabase = createClient()

  // Update timeElapsed every minute locally
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders(prev => prev.map(o => {
        const elapsedMinutes = Math.floor((new Date().getTime() - new Date(o.createdAt).getTime()) / 60000)
        return { ...o, timeElapsed: elapsedMinutes > 0 ? elapsedMinutes : 0 }
      }))
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Real-time Supabase subscription
  useEffect(() => {
    const channel = supabase
      .channel('kds_orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async (payload) => {
          console.log('Realtime change received:', payload)
          const { data } = await getActiveOrders()
          if (data) {
            setOrders(parseDBOrders(data as DBOrder[]))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const advanceStatus = async (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = 'pending'
    if (currentStatus === 'pending') nextStatus = 'preparing'
    else if (currentStatus === 'preparing') nextStatus = 'ready'
    else if (currentStatus === 'ready') nextStatus = 'completed'

    // Optimistic UI update
    if (nextStatus === 'completed') {
      setOrders(orders.filter(o => o.id !== orderId))
    } else {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o))
    }

    // Call server action
    await updateOrderStatus(orderId, nextStatus)
  }

  const getStatusColor = (status: OrderStatus, timeElapsed: number) => {
    if (status === 'preparing') return 'bg-amber-900 border-amber-500'
    if (status === 'ready') return 'bg-emerald-900 border-emerald-500'
    // Pending
    if (timeElapsed > 5) return 'bg-red-900 border-red-500' // Delayed
    return 'bg-slate-800 border-slate-600'
  }

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'Por preparar'
      case 'preparing': return 'Preparando'
      case 'ready': return 'Listo'
      default: return ''
    }
  }

  return (
    <div className="flex gap-4 h-full min-w-max">
      {orders.map((order) => (
        <div 
          key={order.id} 
          className={`w-80 flex flex-col rounded-xl border-2 overflow-hidden shadow-lg ${getStatusColor(order.status, order.timeElapsed)}`}
        >
          {/* Header */}
          <div className="p-3 border-b border-white/10 flex justify-between items-center bg-black/20">
            <div className="font-bold text-xl">#{order.ticketNumber}</div>
            <div className="flex gap-2">
              <div className="text-sm font-bold px-2 py-1 rounded bg-black/30 text-slate-300">
                {getStatusText(order.status)}
              </div>
              <div className={`text-sm font-bold px-2 py-1 rounded ${order.timeElapsed > 5 && order.status === 'pending' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-700'}`}>
                {order.timeElapsed} min
              </div>
            </div>
          </div>
          
          {/* Items */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="bg-black/20 p-3 rounded-lg border border-white/5">
                <div className="flex gap-3 text-lg font-medium">
                  <span className="text-emerald-400 font-bold">{item.quantity}x</span>
                  <span>{item.name}</span>
                </div>
                {item.notes && (
                  <div className="mt-2 text-sm text-amber-300 bg-amber-900/30 p-2 rounded border border-amber-500/30 flex gap-2">
                    <span>⚠️</span> {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="p-3 bg-black/30">
            <button 
              onClick={() => advanceStatus(order.id, order.status)}
              className={`w-full py-3 rounded-lg font-bold text-lg transition-colors ${
                order.status === 'pending' ? 'bg-amber-600 hover:bg-amber-500 text-white' :
                order.status === 'preparing' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' :
                'bg-slate-600 hover:bg-slate-500 text-white'
              }`}
            >
              {order.status === 'pending' ? 'Empezar a Preparar' :
               order.status === 'preparing' ? 'Marcar como Listo' :
               'Entregar al Cliente'}
            </button>
          </div>
        </div>
      ))}

      {orders.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 min-w-[600px]">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-2xl font-bold">No hay comandas activas</p>
          <p className="mt-2">Buen trabajo, cocina limpia.</p>
        </div>
      )}
    </div>
  )
}
