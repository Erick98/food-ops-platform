import { getInventory } from '../actions'
import InventoryClient from './inventory-client'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const { data: inventory } = await getInventory()
  
  return <InventoryClient inventory={inventory || []} />
}
