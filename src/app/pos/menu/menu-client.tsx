'use client'

import { useState } from 'react'
import { createProduct, toggleProductStatus } from './actions'
import { Plus, Search, Tag, DollarSign, PackageOpen } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MenuClient({ initialProducts }: { initialProducts: any[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducts = initialProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await createProduct(formData)
    setIsAdding(false)
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Catálogo / Menú</h1>
          <p className="text-slate-500 text-sm">Gestiona los productos disponibles en el Punto de Venta</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </header>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200 mb-6">
          <h2 className="text-lg font-bold mb-4">Agregar Nuevo Producto</h2>
          <form onSubmit={handleAdd} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input name="name" required className="w-full border rounded px-3 py-2" placeholder="Ej. Frappe Moka" />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
              <input name="category" required className="w-full border rounded px-3 py-2" placeholder="Ej. Bebidas Frías" />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio</label>
              <input name="price" type="number" step="0.01" required className="w-full border rounded px-3 py-2" placeholder="0.00" />
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 h-[42px]">
              Guardar
            </button>
          </form>
        </div>
      )}

      <div className="flex-1 bg-white rounded-lg shadow border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full border rounded-md pl-9 pr-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 border-b">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-slate-600">Producto</th>
                <th className="px-6 py-3 text-sm font-semibold text-slate-600">Categoría</th>
                <th className="px-6 py-3 text-sm font-semibold text-slate-600">Precio</th>
                <th className="px-6 py-3 text-sm font-semibold text-slate-600">Estado</th>
                <th className="px-6 py-3 text-sm font-semibold text-slate-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded text-slate-500">
                        <PackageOpen className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-slate-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Tag className="w-4 h-4 text-slate-400" />
                      {p.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center text-slate-700">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      {p.price}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {p.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => toggleProductStatus(p.id, p.is_active)}
                      className={`text-sm font-medium ${p.is_active ? 'text-red-600 hover:text-red-800' : 'text-emerald-600 hover:text-emerald-800'}`}
                    >
                      {p.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
