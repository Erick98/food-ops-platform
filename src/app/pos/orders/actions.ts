'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'closed' | 'cancelled'

export type OrderItem = {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  notes: string | null
  products: { name: string; category: string } | null
}

export type Order = {
  id: string
  tenant_id: string
  profile_id: string
  status: OrderStatus
  total_amount: number
  payment_method: string
  table_id: string | null
  created_at: string
  updated_at: string
  order_items: OrderItem[]
  tables: { name: string; zone: string } | null
  profiles: { full_name: string | null } | null
}

// Mock data for development
const MOCK_ORDERS: Order[] = [
  {
    id: 'order-001',
    tenant_id: 'mock',
    profile_id: 'staff-1',
    status: 'pending',
    total_amount: 145.00,
    payment_method: 'cash',
    table_id: '2',
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    order_items: [
      { id: 'oi-1', product_id: 'p1', quantity: 2, unit_price: 45, subtotal: 90, notes: null, products: { name: 'Café Americano', category: 'Bebidas' } },
      { id: 'oi-2', product_id: 'p2', quantity: 1, unit_price: 55, subtotal: 55, notes: 'Sin azúcar', products: { name: 'Croissant', category: 'Panadería' } },
    ],
    tables: { name: 'Mesa 2', zone: 'Terraza' },
    profiles: { full_name: 'Ana García' },
  },
  {
    id: 'order-002',
    tenant_id: 'mock',
    profile_id: 'staff-2',
    status: 'preparing',
    total_amount: 290.00,
    payment_method: 'card',
    table_id: null,
    created_at: new Date(Date.now() - 12 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    order_items: [
      { id: 'oi-3', product_id: 'p3', quantity: 3, unit_price: 58, subtotal: 174, notes: null, products: { name: 'Tacos de Suadero', category: 'Tacos' } },
      { id: 'oi-4', product_id: 'p4', quantity: 2, unit_price: 25, subtotal: 50, notes: null, products: { name: 'Agua de Jamaica', category: 'Bebidas' } },
      { id: 'oi-5', product_id: 'p5', quantity: 2, unit_price: 33, subtotal: 66, notes: null, products: { name: 'Sopa de Lima', category: 'Caldos' } },
    ],
    tables: null,
    profiles: { full_name: 'Carlos López' },
  },
  {
    id: 'order-003',
    tenant_id: 'mock',
    profile_id: 'staff-1',
    status: 'ready',
    total_amount: 75.00,
    payment_method: 'cash',
    table_id: null,
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    order_items: [
      { id: 'oi-6', product_id: 'p6', quantity: 1, unit_price: 75, subtotal: 75, notes: 'Extra picante', products: { name: 'Combo Garnachaland', category: 'Combos' } },
    ],
    tables: null,
    profiles: { full_name: 'Ana García' },
  },
]

export async function getOrders(statusFilter?: OrderStatus[]): Promise<{ data: Order[]; error: string | null }> {
  try {
    const supabase = createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()

    if (authErr || !user) {
      const filtered = statusFilter
        ? MOCK_ORDERS.filter(o => statusFilter.includes(o.status))
        : MOCK_ORDERS
      return { data: filtered, error: null }
    }

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items(*, products(name, category)),
        tables(name, zone),
        profiles(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (statusFilter && statusFilter.length > 0) {
      query = query.in('status', statusFilter)
    }

    const { data, error } = await query
    if (error) return { data: MOCK_ORDERS, error: error.message }
    return { data: (data as unknown as Order[]) || [], error: null }
  } catch (e) {
    console.error('getOrders error:', e)
    return { data: MOCK_ORDERS, error: null }
  }
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('Mock updateOrderStatus:', orderId, newStatus)
      return { success: true }
    }

    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('table_id')
      .eq('id', orderId)
      .single()

    if (fetchErr) return { success: false, error: fetchErr.message }

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) return { success: false, error: error.message }

    // If closing/cancelling and has a table → free the table
    if ((newStatus === 'closed' || newStatus === 'cancelled') && order?.table_id) {
      await supabase
        .from('tables')
        .update({ status: 'dirty', current_order_id: null })
        .eq('id', order.table_id)
      revalidatePath('/pos/tables')
    }

    revalidatePath('/pos/orders')
    revalidatePath('/pos/kds')
    return { success: true }
  } catch (e) {
    console.error('updateOrderStatus error:', e)
    return { success: false, error: String(e) }
  }
}

export async function getDailySummary(): Promise<{
  totalSales: number
  orderCount: number
  avgTicket: number
  byStatus: Record<OrderStatus, number>
}> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { totalSales: 510, orderCount: 3, avgTicket: 170, byStatus: { pending: 1, preparing: 1, ready: 1, closed: 0, cancelled: 0 } }
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data } = await supabase
      .from('orders')
      .select('status, total_amount')
      .gte('created_at', todayStart.toISOString())

    if (!data) return { totalSales: 0, orderCount: 0, avgTicket: 0, byStatus: { pending: 0, preparing: 0, ready: 0, closed: 0, cancelled: 0 } }

    const byStatus: Record<OrderStatus, number> = { pending: 0, preparing: 0, ready: 0, closed: 0, cancelled: 0 }
    let totalSales = 0
    data.forEach(o => {
      byStatus[o.status as OrderStatus] = (byStatus[o.status as OrderStatus] || 0) + 1
      if (o.status === 'closed') totalSales += o.total_amount
    })

    return {
      totalSales,
      orderCount: data.length,
      avgTicket: data.length > 0 ? totalSales / Math.max(byStatus.closed, 1) : 0,
      byStatus,
    }
  } catch (e) {
    console.error('getDailySummary error:', e)
    return { totalSales: 0, orderCount: 0, avgTicket: 0, byStatus: { pending: 0, preparing: 0, ready: 0, closed: 0, cancelled: 0 } }
  }
}
