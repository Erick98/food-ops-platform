import { getProducts, getInventory } from '../actions'
import { RecipesManager } from '@/components/recipes-manager'

export const metadata = {
  title: 'Recetas y Escandallos (B.O.M) | Food-Ops'
}

export default async function RecipesPage() {
  const { data: products } = await getProducts()
  const { data: inventory } = await getInventory()

  return (
    <div className="p-4 lg:p-8 flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Recetas / Escandallos (B.O.M)</h1>
          <p className="text-slate-500 mt-1">
            Configura los ingredientes que componen cada producto.
            Al completarse una venta, el inventario se descontará automáticamente.
          </p>
        </div>
        
        <RecipesManager 
          initialProducts={products}
          inventoryItems={inventory}
        />
      </div>
    </div>
  )
}
