import { getProducts } from '../actions'
import MenuClient from './menu-client'

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  const { data: products } = await getProducts()
  
  return <MenuClient products={products || []} />
}
