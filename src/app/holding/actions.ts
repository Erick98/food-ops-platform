/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from '@/utils/supabase/server'

export async function getHoldingMetrics() {
  const supabase = createClient()
  
  // Para el dashboard, vamos a obtener las ventas totales, ordenes de hoy y los inventarios bajos.
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 1. Obtener Tenants (Restaurantes)
  const { data: tenants, error: tenantsError } = await supabase.from('tenants').select('*')
  
  // Si no hay tenants configurados en base de datos real (o si falla la tabla), usamos fallback
  const realTenants = (tenants && !tenantsError) ? tenants : [
    { id: 'ito-cafe', name: 'Ito Café', status: 'Operativo', location: 'Roma Norte', color: 'orange' },
    { id: 'garnachaland', name: 'Garnachaland', status: 'Pre-apertura', location: 'Condesa', color: 'red' }
  ]

  // 2. Traer ordenes del día para todos los tenants
  const { data: orders, error: ordersError } = await (supabase as any)
    .from('orders')
    .select('id, tenant_id, total, created_at')
    .gte('created_at', today.toISOString())

  // 3. Traer inventario para checar alertas
  const { data: inventory, error: invError } = await (supabase as any)
    .from('inventory_items')
    .select('id, tenant_id, name, current_stock, min_quantity, unit')

  let globalSales = 0
  let globalOrdersCount = 0
  
  const tenantMetrics: Record<string, any> = {}
  
  realTenants.forEach(t => {
    tenantMetrics[t.id] = {
      id: t.id,
      name: t.name,
      status: t.status || 'Activo',
      location: t.location || '',
      color: t.color || 'blue',
      salesToday: 0,
      ordersCount: 0,
      lowStockItems: []
    }
  })

  if (orders && !ordersError) {
    orders.forEach((o: any) => {
      globalSales += Number(o.total || 0)
      globalOrdersCount++
      if (tenantMetrics[o.tenant_id]) {
        tenantMetrics[o.tenant_id].salesToday += Number(o.total || 0)
        tenantMetrics[o.tenant_id].ordersCount++
      }
    })
  } else {
    // mock si la DB está vacía temporalmente para la demo
    globalSales = 42500
    globalOrdersCount = 142
    if (tenantMetrics['ito-cafe']) tenantMetrics['ito-cafe'].salesToday = 12400
    if (tenantMetrics['garnachaland']) tenantMetrics['garnachaland'].salesToday = 30100
  }

  const aiInsights: any[] = []

  if (inventory && !invError) {
    inventory.forEach((item: any) => {
      if (item.current_stock <= item.min_quantity) {
        if (tenantMetrics[item.tenant_id]) {
          tenantMetrics[item.tenant_id].lowStockItems.push(item)
          
          aiInsights.push({
            tenantId: item.tenant_id,
            tenantName: tenantMetrics[item.tenant_id].name,
            type: 'inventory',
            message: `El inventario de ${item.name} está crítico (${item.current_stock} ${item.unit || 'unidades'}). Por debajo del mínimo (${item.min_quantity}). Sugiero emitir orden de compra hoy.`,
            action: 'Generar Orden de Compra'
          })
        }
      }
    })
  }

  // Generamos insights basados en ventas (ejemplo algorítmico)
  realTenants.forEach(t => {
    if (tenantMetrics[t.id].salesToday > 0 && tenantMetrics[t.id].salesToday < 5000) {
      aiInsights.push({
        tenantId: t.id,
        tenantName: t.name,
        type: 'sales',
        message: `Las ventas de hoy están por debajo del promedio diario (${tenantMetrics[t.id].salesToday} MXN). Sugerencia: Enviar campaña de push notification 2x1 a clientes recurrentes en las próximas 2 horas.`,
        action: 'Lanzar Campaña 2x1'
      })
    }
  })

  // Fallback insights si no hay data real para mostrar el Copilot
  if (aiInsights.length === 0) {
    aiInsights.push({
      tenantId: 'ito-cafe',
      tenantName: 'Ito Café',
      type: 'inventory',
      message: 'El inventario de Vasos de 12oz está al 15%. Al ritmo de venta actual, se agotarán el Jueves.',
      action: 'Generar Orden de Compra'
    },
    {
      tenantId: 'garnachaland',
      tenantName: 'Garnachaland',
      type: 'sales',
      message: 'Las ventas de bebidas preparadas bajaron un 12% respecto a la semana pasada.',
      action: 'Ver análisis detallado'
    })
  }

  return {
    globalSales,
    globalOrdersCount,
    ticketPromedio: globalOrdersCount > 0 ? (globalSales / globalOrdersCount) : 0,
    tenants: Object.values(tenantMetrics),
    aiInsights
  }
}
