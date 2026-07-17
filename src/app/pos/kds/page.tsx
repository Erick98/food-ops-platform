import { getActiveOrders } from '../actions'
import KDSClient from './kds-client'

export const dynamic = 'force-dynamic'

export default async function KDSPage() {
  const { data: orders } = await getActiveOrders()
  
  return <KDSClient orders={orders || []} />
}
