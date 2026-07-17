export const dynamic = 'force-dynamic'

import { OrdersClient } from './orders-client'
import { getOrders, getDailySummary } from './actions'

export default async function OrdersPage() {
  const [{ data: orders }, summary] = await Promise.all([
    getOrders(),
    getDailySummary(),
  ])

  return <OrdersClient orders={orders} summary={summary} />
}
