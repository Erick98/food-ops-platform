'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Save, Trash2, Search, BookOpen } from 'lucide-react'
import { getRecipeIngredients, updateRecipeIngredients } from '@/app/pos/actions'

interface Product {
  id: string
  name: string
  category: string
  price: number
}

interface InventoryItem {
  id: string
  name: string
  unit: string
  cost_per_unit: number
}

interface RecipeIngredient {
  inventory_item_id: string
  quantity_required: number
  inventory_items?: {
    name: string
    unit: string
    cost_per_unit: number
  }
}

export function RecipesManager({ 
  initialProducts, 
  inventoryItems 
}: { 
  initialProducts: Product[]
  inventoryItems: InventoryItem[]
}) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Selected product object
  const selectedProduct = initialProducts.find(p => p.id === selectedProductId)

  // Filter products by search
  const filteredProducts = initialProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    if (selectedProductId) {
      loadRecipe(selectedProductId)
    } else {
      setIngredients([])
    }
  }, [selectedProductId])

  async function loadRecipe(productId: string) {
    setIsLoading(true)
    try {
      const res = await getRecipeIngredients(productId)
      if (res.success && res.ingredients) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setIngredients(res.ingredients.map((item: any) => ({
          inventory_item_id: item.inventory_item_id,
          quantity_required: item.quantity_required,
          inventory_items: item.inventory_items
        })))
      } else {
        setIngredients([])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  function handleAddIngredient(inventoryItemId: string) {
    if (!inventoryItemId) return
    
    // Check if already exists
    if (ingredients.some(i => i.inventory_item_id === inventoryItemId)) return

    const invItem = inventoryItems.find(i => i.id === inventoryItemId)
    if (!invItem) return

    setIngredients(prev => [...prev, {
      inventory_item_id: inventoryItemId,
      quantity_required: 0,
      inventory_items: {
        name: invItem.name,
        unit: invItem.unit,
        cost_per_unit: invItem.cost_per_unit
      }
    }])
  }

  function handleRemoveIngredient(inventoryItemId: string) {
    setIngredients(prev => prev.filter(i => i.inventory_item_id !== inventoryItemId))
  }

  function handleUpdateQuantity(inventoryItemId: string, val: string) {
    const qty = parseFloat(val)
    setIngredients(prev => prev.map(i => 
      i.inventory_item_id === inventoryItemId 
        ? { ...i, quantity_required: isNaN(qty) ? 0 : qty } 
        : i
    ))
  }

  async function handleSave() {
    if (!selectedProductId) return
    setIsSaving(true)
    try {
      await updateRecipeIngredients(
        selectedProductId, 
        ingredients.map(i => ({
          inventory_item_id: i.inventory_item_id,
          quantity_required: i.quantity_required
        }))
      )
      alert('Receta guardada exitosamente.')
    } catch (e) {
      console.error(e)
      alert('Error al guardar la receta.')
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate cost
  const totalCost = ingredients.reduce((sum, item) => {
    const cost = item.inventory_items?.cost_per_unit || 0
    return sum + (cost * item.quantity_required)
  }, 0)

  const margin = selectedProduct ? selectedProduct.price - totalCost : 0
  const marginPct = selectedProduct && selectedProduct.price > 0 
    ? (margin / selectedProduct.price) * 100 
    : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Products List */}
      <Card className="lg:col-span-1 border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Productos</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar producto..."
              className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[500px] overflow-y-auto">
          <ul className="divide-y divide-slate-100">
            {filteredProducts.map(p => (
              <li key={p.id}>
                <button 
                  onClick={() => setSelectedProductId(p.id)}
                  className={`w-full text-left px-6 py-3 hover:bg-slate-50 transition-colors ${selectedProductId === p.id ? 'bg-slate-100 border-l-4 border-slate-900' : 'border-l-4 border-transparent'}`}
                >
                  <div className="font-medium text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.category} • ${p.price.toFixed(2)}</div>
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card className="lg:col-span-2 border-none shadow-sm flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {selectedProduct ? `Receta: ${selectedProduct.name}` : 'Selecciona un producto'}
            </CardTitle>
            <CardDescription>
              {selectedProduct 
                ? 'Define los insumos y proporciones (Escandallo)' 
                : 'Selecciona un producto del panel izquierdo para editar su receta.'}
            </CardDescription>
          </div>
          {selectedProduct && (
            <Button onClick={handleSave} disabled={isSaving || isLoading} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? 'Guardando...' : 'Guardar Receta'}
            </Button>
          )}
        </CardHeader>
        
        {selectedProduct ? (
          <CardContent className="flex-1 flex flex-col">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-lg border">
                <div className="text-xs text-slate-500 font-medium mb-1">Costo Total</div>
                <div className="text-xl font-bold text-slate-900">${totalCost.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border">
                <div className="text-xs text-slate-500 font-medium mb-1">Precio Venta</div>
                <div className="text-xl font-bold text-slate-900">${selectedProduct.price.toFixed(2)}</div>
              </div>
              <div className={`p-4 rounded-lg border ${marginPct >= 65 ? 'bg-green-50 border-green-200 text-green-800' : marginPct >= 50 ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                <div className="text-xs font-medium mb-1">Margen / Food Cost</div>
                <div className="text-xl font-bold">{marginPct.toFixed(1)}%</div>
              </div>
            </div>

            {/* Ingredients Table */}
            <div className="flex items-center gap-2 mb-4">
              <select 
                className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                onChange={(e) => {
                  handleAddIngredient(e.target.value)
                  e.target.value = ''
                }}
                defaultValue=""
              >
                <option value="" disabled>+ Agregar insumo al escandallo...</option>
                {inventoryItems.map(inv => (
                  <option key={inv.id} value={inv.id} disabled={ingredients.some(i => i.inventory_item_id === inv.id)}>
                    {inv.name} ({inv.unit}) - ${inv.cost_per_unit}/u
                  </option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                Cargando receta...
              </div>
            ) : ingredients.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 border-2 border-dashed rounded-lg p-8">
                Esta receta no tiene insumos asignados.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden flex-1">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">Insumo</th>
                      <th className="px-4 py-3 font-medium w-32">Cantidad</th>
                      <th className="px-4 py-3 font-medium w-24">Costo</th>
                      <th className="px-4 py-3 font-medium w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ingredients.map(item => {
                      const cost = (item.inventory_items?.cost_per_unit || 0) * item.quantity_required
                      return (
                        <tr key={item.inventory_item_id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">{item.inventory_items?.name}</div>
                            <div className="text-xs text-slate-500">${item.inventory_items?.cost_per_unit} / {item.inventory_items?.unit}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                min="0" 
                                step="0.0001"
                                className="w-20 border rounded px-2 py-1 focus:outline-none focus:border-slate-400"
                                value={item.quantity_required || ''}
                                onChange={e => handleUpdateQuantity(item.inventory_item_id, e.target.value)}
                              />
                              <span className="text-slate-500 text-xs">{item.inventory_items?.unit}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium">
                            ${cost.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button 
                              onClick={() => handleRemoveIngredient(item.inventory_item_id)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 text-xs text-slate-500">
              * Nota: Food Cost saludable para comida es ~33% (Margen 67%). Para bebidas ~20% (Margen 80%).
            </div>
          </CardContent>
        ) : (
          <CardContent className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <BookOpen className="w-12 h-12 mb-4 text-slate-200" />
            <p>Selecciona un producto para configurar su receta</p>
          </CardContent>
        )}
      </Card>
      
    </div>
  )
}
