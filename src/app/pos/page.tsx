export const dynamic = "force-dynamic"
import { POSClient } from './pos-client'
import { getProducts } from './actions'
import { getTables } from './tables/actions'

export default async function POSPage() {
  const { data: products } = await getProducts()
  const tables = await getTables()
  
  return <POSClient products={products || []} tables={tables || []} />
}
