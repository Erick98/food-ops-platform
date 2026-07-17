'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tag, Plus, Calendar, Percent, CheckCircle, XCircle } from 'lucide-react'
import { createPromotion, togglePromotion } from './actions'

type Promotion = {
  id: string;
  name: string;
  type: string;
  value: number;
  applies_to: string[];
  time_from: string | null;
  time_to: string | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
}

export function PromotionsClient({ initialPromos }: { initialPromos: Promotion[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    await createPromotion(formData)
    setIsAdding(false)
    setIsSubmitting(false)
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 overflow-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Promociones y Campañas</h1>
          <p className="text-slate-500 text-sm">Gestiona descuentos, combos y promociones de temporada</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Cancelar' : 'Nueva Promoción'}
        </button>
      </header>

      {isAdding && (
        <Card className="mb-6 border-indigo-100">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg">Crear Nueva Promoción</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleAdd} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Promoción</label>
                  <input name="name" required className="w-full border rounded px-3 py-2" placeholder="Ej. Tarde Dulce" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select name="type" required className="w-full border rounded px-3 py-2 bg-white">
                    <option value="pct_discount">Descuento (%)</option>
                    <option value="fixed_discount">Descuento (Fijo $)</option>
                    <option value="combo">Combo (Precio Especial)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor</label>
                  <input name="value" type="number" step="0.01" required className="w-full border rounded px-3 py-2" placeholder="Ej. 20" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categorías que Aplican (separadas por coma)</label>
                  <input name="categories" className="w-full border rounded px-3 py-2" placeholder="Ej. Postres, Bebidas Calientes" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora Inicio (Opcional)</label>
                  <input name="time_from" type="time" className="w-full border rounded px-3 py-2" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora Fin (Opcional)</label>
                  <input name="time_to" type="time" className="w-full border rounded px-3 py-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inicio (Opcional)</label>
                  <input name="valid_from" type="date" className="w-full border rounded px-3 py-2" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Fin (Opcional)</label>
                  <input name="valid_until" type="date" className="w-full border rounded px-3 py-2" />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Promoción'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-indigo-100">
          <CardHeader className="pb-4">
            <CardTitle>Promociones Registradas</CardTitle>
          </CardHeader>
          <CardContent>
            {initialPromos.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No hay promociones registradas aún.
              </div>
            ) : (
              <div className="space-y-4">
                {initialPromos.map(promo => (
                  <div key={promo.id} className={`border rounded-lg p-4 flex justify-between items-center bg-white shadow-sm transition-opacity ${!promo.is_active ? 'opacity-60 grayscale' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${promo.type === 'pct_discount' ? 'bg-pink-100 text-pink-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        {promo.type === 'pct_discount' ? <Percent className="w-6 h-6" /> : <Tag className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{promo.name}</h3>
                        <p className="text-sm text-slate-500">
                          {promo.time_from && promo.time_to ? `Aplica de ${promo.time_from.substring(0,5)} a ${promo.time_to.substring(0,5)}` : 'Todo el día'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${promo.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                            {promo.is_active ? 'Activa' : 'Inactiva'}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3"/> 
                            {promo.valid_until ? `Hasta ${promo.valid_until}` : 'Indefinido'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="font-bold text-xl">
                        {promo.type === 'pct_discount' ? `-${promo.value}%` : `$${promo.value}`}
                      </div>
                      <div className="text-xs text-slate-400">
                        {promo.applies_to?.length ? `Aplica en: ${promo.applies_to.join(', ')}` : 'Aplica a todo'}
                      </div>
                      <button 
                        onClick={() => togglePromotion(promo.id, promo.is_active)}
                        className={`text-xs flex items-center gap-1 mt-1 font-medium ${promo.is_active ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}
                      >
                        {promo.is_active ? <><XCircle className="w-3 h-3"/> Desactivar</> : <><CheckCircle className="w-3 h-3"/> Activar</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">Uso de Promociones (Hoy)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
              <p className="text-xs text-slate-400 mt-1">Órdenes con descuento aplicado (Simulado)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">Retorno Estimado (Semana)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">+$850</div>
              <p className="text-xs text-slate-400 mt-1">Venta incremental por upselling (Simulado)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
