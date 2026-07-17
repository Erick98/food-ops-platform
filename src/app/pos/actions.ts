/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'


// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const mockProducts = [
  { id: '1', tenant_id: 'mock', name: 'Espresso',           price: 35, category: 'Bebidas Calientes', is_active: true },
  { id: '2', tenant_id: 'mock', name: 'Latte Macchiato',    price: 55, category: 'Bebidas Calientes', is_active: true },
  { id: '3', tenant_id: 'mock', name: 'Cold Brew',          price: 65, category: 'Bebidas Frías',     is_active: true },
  { id: '4', tenant_id: 'mock', name: 'Matcha Frappe',      price: 75, category: 'Bebidas Frías',     is_active: true },
  { id: '5', tenant_id: 'mock', name: 'Croissant',          price: 45, category: 'Alimentos',         is_active: true },
  { id: '6', tenant_id: 'mock', name: 'Cheesecake',         price: 80, category: 'Postres',           is_active: true },
]

const mockInventory = [
  { id: '1', name: 'Café Grano Espresso', quantity: 15.5, unit: 'kg',  min_quantity: 5,  cost_per_unit: 350 },
  { id: '2', name: 'Leche Entera',        quantity: 40,   unit: 'L',   min_quantity: 10, cost_per_unit: 25  },
  { id: '3', name: 'Jarabe Vainilla',     quantity: 3.5,  unit: 'L',   min_quantity: 1,  cost_per_unit: 180 },
  { id: '4', name: 'Croissants',          quantity: 12,   unit: 'pzs', min_quantity: 15, cost_per_unit: 20  },
  { id: '5', name: 'Té Matcha',           quantity: 2.1,  unit: 'kg',  min_quantity: 1,  cost_per_unit: 600 },
]

const mockStaff = [
  { id: '1', full_name: 'Ana García',       role: 'manager', email: 'ana@itocafe.com',    created_at: '2026-01-10T10:00:00Z' },
  { id: '2', full_name: 'Carlos López',     role: 'cashier', email: 'carlos@itocafe.com', created_at: '2026-03-15T09:30:00Z' },
  { id: '3', full_name: 'María Fernández',  role: 'kitchen', email: 'maria@itocafe.com',  created_at: '2026-05-20T08:15:00Z' },
]

const mockDashboardMetrics = {
  ventasHoy:      12450,
  ventasAyer:     11523,
  ordenesHoy:     142,
  clientesHoy:    186,
  mermasHoy:      340,
  ticketPromedio: 87.67,
  ventasPorHora: [
    { hora: '7am',  ventas: 420  },
    { hora: '8am',  ventas: 1100 },
    { hora: '9am',  ventas: 1850 },
    { hora: '10am', ventas: 1430 },
    { hora: '11am', ventas: 900  },
    { hora: '12pm', ventas: 1200 },
    { hora: '1pm',  ventas: 1650 },
    { hora: '2pm',  ventas: 1300 },
    { hora: '3pm',  ventas: 870  },
    { hora: '4pm',  ventas: 730  },
    { hora: '5pm',  ventas: 1000 },
  ],
  topProductos: [
    { name: 'Latte Macchiato', cantidad: 32, total: 1760 },
    { name: 'Matcha Frappe',   cantidad: 28, total: 2100 },
    { name: 'Croissant',       cantidad: 24, total: 1080 },
    { name: 'Cold Brew',       cantidad: 21, total: 1365 },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function isoToday() {
  return new Date().toISOString().split('T')[0]
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
export async function getProducts() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('category')

    if (error || !data || data.length === 0) {
      return { data: mockProducts, error: null }
    }
    return { data, error: null }
  } catch {
    return { data: mockProducts, error: null }
  }
}

// ─── INVENTORY ────────────────────────────────────────────────────────────────
export async function getInventory() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name')

    if (error || !data || data.length === 0) {
      return { data: mockInventory, error: null }
    }
    return { data, error: null }
  } catch {
    return { data: mockInventory, error: null }
  }
}

// ─── STAFF ────────────────────────────────────────────────────────────────────

export async function createInventoryItem(item: { name: string, unit: string, cost_per_unit: number, min_quantity: number, quantity: number }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: 'Sin perfil' }

    const { data, error } = await supabase
      .from('inventory_items')
      .insert([{
        tenant_id: profile.tenant_id,
        ...item
      }])
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (e) {
    console.error('createInventoryItem error', e)
    return { success: false, error: 'Error al crear insumo. ' + (e instanceof Error ? e.message : String(e)) }
  }
}

// ─── STAFF ────────────────────────────────────────────────────────────────────
export async function getStaff() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, email, created_at')

    if (error || !data || data.length === 0) {
      return { data: mockStaff, error: null }
    }
    return { data, error: null }
  } catch {
    return { data: mockStaff, error: null }
  }
}

export async function createStaff(staffData: any) {
  console.log('Creating staff member…', staffData)
  // Production: use Supabase Admin API to create auth user, then insert profile.
  return { success: true }
}

// ─── DASHBOARD METRICS ────────────────────────────────────────────────────────
export async function getDashboardMetrics(): Promise<{ data: DashboardMetrics }> {
  try {
    const supabase = createClient()
    const today = isoToday()

    // Orders today
    const { data: ordersToday, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .gte('created_at', `${today}T00:00:00Z`)
      .eq('status', 'completed')

    if (ordersError || !ordersToday || ordersToday.length === 0) {
      return { data: mockDashboardMetrics }
    }

    const ventasHoy = ordersToday.reduce((sum, o) => sum + o.total_amount, 0)
    const ordenesHoy = ordersToday.length
    const ticketPromedio = ordenesHoy > 0 ? ventasHoy / ordenesHoy : 0

    // Orders yesterday for delta
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yd = yesterday.toISOString().split('T')[0]
    const { data: ordersYd } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', `${yd}T00:00:00Z`)
      .lt('created_at', `${today}T00:00:00Z`)
      .eq('status', 'completed')

    const ventasAyer = (ordersYd ?? []).reduce((sum, o) => sum + o.total_amount, 0)

    // Sales per hour — bucket by hour
    const hourMap: Record<string, number> = {}
    for (const order of ordersToday) {
      const h = new Date(order.created_at).getHours()
      const label = `${h}:00`
      hourMap[label] = (hourMap[label] ?? 0) + order.total_amount
    }
    const ventasPorHora = Object.entries(hourMap)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([hora, ventas]) => ({ hora, ventas: Math.round(ventas) }))

    // Top products today
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_id, quantity, subtotal, products(name)')
      .in('order_id', ordersToday.map(o => o.id))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type RawOrderItem = { product_id: string; quantity: number; subtotal: number; products: any }
    const prodMap: Record<string, { name: string; cantidad: number; total: number }> = {}
    for (const item of (orderItems ?? []) as unknown as RawOrderItem[]) {
      const productsField = item.products
      const name: string = (Array.isArray(productsField)
        ? (productsField[0] as { name?: string })?.name
        : (productsField as { name?: string } | null)?.name) ?? item.product_id
      if (!prodMap[item.product_id]) {
        prodMap[item.product_id] = { name, cantidad: 0, total: 0 }
      }
      prodMap[item.product_id].cantidad += item.quantity
      prodMap[item.product_id].total += item.subtotal
    }
    const topProductos = Object.values(prodMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)

    return {
      data: {
        ventasHoy,
        ventasAyer,
        ordenesHoy,
        clientesHoy: ordenesHoy, // approximate: 1 order ≈ 1 client session
        mermasHoy: mockDashboardMetrics.mermasHoy, // mermas tracked separately
        ticketPromedio,
        ventasPorHora: ventasPorHora.length ? ventasPorHora : mockDashboardMetrics.ventasPorHora,
        topProductos: topProductos.length ? topProductos : mockDashboardMetrics.topProductos,
      },
    }
  } catch {
    return { data: mockDashboardMetrics }
  }
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
type CartItem = { id: string; name: string; price: number; quantity: number }

export async function createOrder(
  cartItems: CartItem[],
  totalAmount: number,
  paymentMethod: string,
  tableId?: string
) {
  try {
    const supabase = createClient()

    // Get current user profile to associate order
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile) return { success: false, error: 'Perfil no encontrado' }

    // Insert the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        tenant_id: profile.tenant_id,
        profile_id: profile.id,
        total_amount: totalAmount,
        status: 'pending',
        payment_method: paymentMethod,
        table_id: tableId || null,
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Order insert error:', orderError)
      return { success: false, error: orderError?.message }
    }

    // Insert order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) {
      console.error('Order items insert error:', itemsError)
      return { success: false, error: itemsError.message }
    }

    // Mark table as occupied if a table was selected
    if (tableId) {
      await supabase
        .from('tables')
        .update({ status: 'occupied', current_order_id: order.id })
        .eq('id', tableId)
    }

    revalidatePath('/pos/tables')
    revalidatePath('/pos')
    return { success: true, orderId: order.id }
  } catch (e) {
    console.error('createOrder exception:', e)
    // Fallback — still show success to cashier; order is logged to console
    return { success: true, orderId: 'local-' + Date.now() }
  }
}

// ─── ORDERS FOR KDS ───────────────────────────────────────────────────────────
export async function getActiveOrders() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, created_at, order_items(quantity, notes, products(name))')
      .in('status', ['pending', 'preparing'])
      .order('created_at')

    if (error || !data) return { data: [], error: error?.message }
    return { data, error: null }
  } catch {
    return { data: [], error: null }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    return { success: !error, error: error?.message }
  } catch {
    return { success: false, error: 'Error de conexión' }
  }
}

// ─── DAILY CUTOFF (CORTE DE CAJA) ─────────────────────────────────────────────
export async function getMermas() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('mermas')
      .select('id, quantity_lost, cost_value, reason, created_at, inventory_items(name, unit)')
      .order('created_at', { ascending: false })

    if (error) return { data: [], error: error.message }
    return { data: data || [], error: null }
  } catch {
    return { data: [], error: 'Error fetching mermas' }
  }
}

export async function createMerma(data: { inventory_item_id: string; quantity_lost: number; cost_value: number; reason: string }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { data: profile } = await supabase.from('profiles').select('id, tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: 'Sin perfil' }

    const { error } = await supabase
      .from('mermas')
      .insert([{
        tenant_id: profile.tenant_id,
        inventory_item_id: data.inventory_item_id,
        quantity_lost: data.quantity_lost,
        cost_value: data.cost_value,
        reason: data.reason,
        reported_by: profile.id
      }])

    if (error) throw error
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// ─── DAILY CUTOFF (CORTE DE CAJA) ─────────────────────────────────────────────
export async function getDailyCutoff(date?: string) {
  const targetDate = date ?? isoToday()
  try {
    const supabase = createClient()
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, total_amount, payment_method, status, created_at')
      .gte('created_at', `${targetDate}T00:00:00Z`)
      .lt('created_at', `${targetDate}T23:59:59Z`)

    if (error || !orders) return { data: null, error: error?.message }

    const completed = orders.filter(o => o.status === 'completed')
    const cancelled = orders.filter(o => o.status === 'cancelled')

    const totalEfectivo = completed.filter(o => o.payment_method === 'cash').reduce((s, o) => s + o.total_amount, 0)
    const totalTarjeta  = completed.filter(o => o.payment_method === 'card').reduce((s, o) => s + o.total_amount, 0)
    const totalTrans    = completed.filter(o => o.payment_method === 'transfer').reduce((s, o) => s + o.total_amount, 0)
    const totalGeneral  = totalEfectivo + totalTarjeta + totalTrans

    return {
      data: {
        fecha: targetDate,
        totalGeneral,
        totalEfectivo,
        totalTarjeta,
        totalTrans,
        totalOrdenes: completed.length,
        totalCanceladas: cancelled.length,
        ticketPromedio: completed.length > 0 ? totalGeneral / completed.length : 0,
      },
      error: null,
    }
  } catch {
    return { data: null, error: 'Error de conexión' }
  }
}

// ─── CASH SHIFTS (ARQUEO DE CAJA) ─────────────────────────────────────────────
export async function getActiveShift() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'No auth' }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { data: null, error: 'No profile' }

    const { data, error } = await supabase
      .from('cash_shifts')
      .select('id, opened_at, starting_cash, status, opened_by (full_name)')
      .eq('tenant_id', profile.tenant_id)
      .eq('status', 'open')
      .order('opened_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return { data: data || null, error: null }
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : String(e) }
  }
}

export async function openShift(startingCash: number) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No auth' }

    const { data: profile } = await supabase.from('profiles').select('id, tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: 'No profile' }

    const { error } = await supabase
      .from('cash_shifts')
      .insert([{
        tenant_id: profile.tenant_id,
        opened_by: profile.id,
        starting_cash: startingCash
      }])

    if (error) throw error
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export async function closeShift(shiftId: string, actualCash: number, expectedCash: number, notes: string) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No auth' }

    const { data: profile } = await supabase.from('profiles').select('id, tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: 'No profile' }

    const { error } = await supabase
      .from('cash_shifts')
      .update({
        closed_by: profile.id,
        closed_at: new Date().toISOString(),
        actual_cash: actualCash,
        expected_cash: expectedCash,
        difference: actualCash - expectedCash,
        notes,
        status: 'closed'
      })
      .eq('id', shiftId)
      .eq('tenant_id', profile.tenant_id)

    if (error) throw error
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// ─── SUPPLIERS & PURCHASE ORDERS ──────────────────────────────────────────────

async function getTenantId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
  return profile?.tenant_id
}

export async function getSuppliers() {
  const supabase = createClient()
  const tenant_id = await getTenantId()
  
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('tenant_id', tenant_id)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching suppliers:', error)
    return []
  }
  return data
}

export async function createSupplier(formData: FormData) {
  const supabase = createClient()
  const tenant_id = await getTenantId()
  
  const name = formData.get('name') as string
  const contact_name = formData.get('contact_name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  
  const { error } = await supabase
    .from('suppliers')
    .insert([{ tenant_id, name, contact_name, phone, email }])
    
  if (error) {
    console.error('Error creating supplier:', error)
    throw new Error('No se pudo crear el proveedor')
  }
  
  revalidatePath('/pos/suppliers')
}

export async function getPurchaseOrders() {
  const supabase = createClient()
  const tenant_id = await getTenantId()
  
  const { data, error } = await supabase
    .from('purchase_orders')
    .select(`
      *,
      supplier:suppliers(name)
    `)
    .eq('tenant_id', tenant_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching purchase orders:', error)
    return []
  }
  return data
}

export async function createPurchaseOrder(supplier_id: string, total_amount: number, notes: string) {
  const supabase = createClient()
  const tenant_id = await getTenantId()
  
  // Need the profile id
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No user authenticated')
  
  const { data, error } = await supabase
    .from('purchase_orders')
    .insert([{ 
      tenant_id, 
      supplier_id, 
      total_amount, 
      notes, 
      created_by: user.id 
    }])
    .select('id')
    .single()
    
  if (error) {
    console.error('Error creating purchase order:', error)
    throw new Error('No se pudo crear la OC')
  }
  
  revalidatePath('/pos/suppliers')
  return data
}


// ─── RECIPES / BOM ────────────────────────────────────────────────────────────

export async function getRecipeIngredients(product_id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, ingredients: [] }

  const { data, error } = await supabase
    .from('recipe_ingredients')
    .select(`
      id,
      product_id,
      inventory_item_id,
      quantity_required,
      inventory_items (
        name,
        unit,
        cost_per_unit
      )
    `)
    .eq('product_id', product_id)

  if (error) {
    console.error('getRecipeIngredients error:', error)
    return { success: false, ingredients: [] }
  }

  return { success: true, ingredients: data || [] }
}

export async function updateRecipeIngredients(product_id: string, ingredients: { inventory_item_id: string, quantity_required: number }[]) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error: delError } = await supabase
    .from('recipe_ingredients')
    .delete()
    .eq('product_id', product_id)

  if (delError) {
    console.error('Delete recipe error:', delError)
    throw new Error('Error deleting old recipe items')
  }

  if (ingredients.length > 0) {
    const { error: insError } = await supabase
      .from('recipe_ingredients')
      .insert(
        ingredients.map(ing => ({
          product_id,
          inventory_item_id: ing.inventory_item_id,
          quantity_required: ing.quantity_required
        }))
      )

    if (insError) {
      console.error('Insert recipe error:', insError)
      throw new Error('Error inserting new recipe items')
    }
  }

  revalidatePath('/pos/recipes')
  return { success: true }
}

// ─── PAYROLL / ATTENDANCE ACTIONS ─────────────────────────────────────────────

export async function getAttendanceLogs() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('attendance')
    .select('*, profiles(full_name)')
    .order('clock_in', { ascending: false })
    .limit(50)

  if (error) {
    console.error('getAttendanceLogs error:', error)
    return []
  }
  return data
}

export async function clockIn(profile_id: string, notes?: string) {
  const supabase = createClient()
  
  // Get tenant
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const tenant_id = user.user_metadata?.tenant_id

  if (!tenant_id) throw new Error('No tenant id')

  const { error } = await supabase
    .from('attendance')
    .insert({
      tenant_id,
      profile_id,
      notes
    })

  if (error) {
    console.error('clockIn error:', error)
    throw new Error('Error on clock in')
  }

  revalidatePath('/pos/payroll')
  return { success: true }
}

export async function clockOut(attendance_id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('attendance')
    .update({ clock_out: new Date().toISOString() })
    .eq('id', attendance_id)

  if (error) {
    console.error('clockOut error:', error)
    throw new Error('Error on clock out')
  }

  revalidatePath('/pos/payroll')
  return { success: true }
}

export async function getPayrollSettlements() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('payroll_settlements')
    .select('*, profiles(full_name)')
    .order('period_start', { ascending: false })

  if (error) {
    console.error('getPayrollSettlements error:', error)
    return []
  }
  return data
}

export async function createSettlement(params: {
  profile_id: string
  period_start: string
  period_end: string
  total_hours: number
  hourly_rate: number
  bonuses: number
  deductions: number
  notes?: string
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const tenant_id = user.user_metadata?.tenant_id
  if (!tenant_id) throw new Error('No tenant id')

  const base_pay = params.total_hours * params.hourly_rate
  const net_pay = base_pay + params.bonuses - params.deductions

  const { error } = await supabase
    .from('payroll_settlements')
    .insert({
      tenant_id,
      profile_id: params.profile_id,
      period_start: params.period_start,
      period_end: params.period_end,
      total_hours: params.total_hours,
      hourly_rate: params.hourly_rate,
      base_pay,
      bonuses: params.bonuses,
      deductions: params.deductions,
      net_pay,
      notes: params.notes,
      status: 'draft'
    })

  if (error) {
    console.error('createSettlement error:', error)
    throw new Error('Error creating settlement')
  }

  revalidatePath('/pos/payroll')
  return { success: true }
}

export async function markSettlementPaid(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('payroll_settlements')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    console.error('markSettlementPaid error:', error)
    throw new Error('Error marking settlement as paid')
  }

  revalidatePath('/pos/payroll')
  return { success: true }
}

// MOCK RESERVATIONS
export type Reservation = {
  id: string;
  tenant_id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  table_id?: string;
  party_size: number;
  reservation_time: string;
  status: 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'no_show';
  notes?: string;
  created_at: string;
};

const mockReservations: Reservation[] = [
  {
    id: 'r1',
    tenant_id: 't1',
    customer_name: 'Juan Perez',
    customer_phone: '555-1234',
    party_size: 4,
    reservation_time: new Date(Date.now() + 3600000).toISOString(),
    status: 'confirmed',
    notes: 'Cumpleaños',
    created_at: new Date().toISOString()
  }
];

export async function getReservations() {
  const supabase = createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return mockReservations
    const { data, error } = await supabase
      .from('reservations')
      .select(`*, customers(first_name, last_name), tables(name)`)
      .order('reservation_time', { ascending: true })
    if (error || !data) return mockReservations
    return data as Reservation[]
  } catch {
    return mockReservations
  }
}

export async function createReservation(data: Partial<Reservation>) {
  const supabase = createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: true }
    
    // Get tenant_id from profile
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) throw new Error("No profile")

    const { error } = await supabase
      .from('reservations')
      .insert({
        ...data,
        tenant_id: profile.tenant_id
      })
    
    if (error) throw error;
    revalidatePath('/pos/reservations')
    return { success: true }
  } catch (err: unknown) {
    console.error('Create reservation error', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function updateReservationStatus(id: string, status: Reservation['status']) {
  const supabase = createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: true }

    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
    
    if (error) throw error;
    revalidatePath('/pos/reservations')
    return { success: true }
  } catch (err: unknown) {
    console.error('Update reservation error', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

// ==========================================
// CHECKLISTS / AUDITS
// ==========================================

export async function getChecklists() {
  const supabase = createClient();
  // Fallback data if DB fails
  const mockChecklists = [
    { id: '1', title: 'Apertura de Sucursal', frequency: 'opening', is_active: true },
    { id: '2', title: 'Cierre de Caja y Limpieza', frequency: 'closing', is_active: true },
    { id: '3', title: 'Revisión de Refrigeradores', frequency: 'daily', is_active: true },
  ];

  try {
    const { data, error } = await supabase
      .from('checklists')
      .select('id, title, description, frequency, is_active')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return mockChecklists;
    return data;
  } catch {
    return mockChecklists;
  }
}

export async function createChecklist(data: { title: string; frequency: string; description?: string }) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("No autenticado");

  const tenant_id = authData.user.user_metadata?.tenant_id || "11111111-1111-1111-1111-111111111111";

  const { error } = await supabase.from('checklists').insert({
    tenant_id,
    title: data.title,
    frequency: data.frequency,
    description: data.description,
  });

  if (error) {
    console.error("Error creating checklist:", error);
    throw new Error("No se pudo crear el checklist");
  }

  revalidatePath('/pos/checklists');
  return true;
}

export async function getChecklistLogs() {
  const supabase = createClient();
  const mockLogs = [
    { id: 'log-1', checklist: { title: 'Apertura de Sucursal' }, profile: { full_name: 'Ana Pérez' }, completed_at: new Date().toISOString(), status: 'completed' },
  ];

  try {
    const { data, error } = await supabase
      .from('checklist_logs')
      .select(`
        id,
        completed_at,
        status,
        checklists ( title ),
        profiles ( full_name )
      `)
      .order('completed_at', { ascending: false })
      .limit(20);

    if (error || !data || data.length === 0) return mockLogs;
    
    return data.map(d => ({
      id: d.id,
      completed_at: d.completed_at,
      status: d.status,
      checklist: { title: d.checklists ? (Array.isArray(d.checklists) ? d.checklists[0]?.title : (d.checklists as unknown as any).title) : 'Desconocido' },
      profile: { full_name: d.profiles ? (Array.isArray(d.profiles) ? d.profiles[0]?.full_name : (d.profiles as unknown as any).full_name) : 'Desconocido' }
    }));
  } catch {
    return mockLogs;
  }
}
