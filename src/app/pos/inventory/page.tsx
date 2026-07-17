import { InventoryClient } from './inventory-client'
import { getInventory } from '../actions'

export default async function InventoryPage() {
  const { data: items } = await getInventory()
  
  return <InventoryClient items={items || []} />
}
