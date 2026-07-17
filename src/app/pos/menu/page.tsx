export const dynamic = 'force-dynamic'

import { MenuClient } from './menu-client'
import { getProducts } from '../actions'

export default async function MenuPage() {
  const { data: products } = await getProducts()
  
  return <MenuClient initialProducts={products || []} />
}
