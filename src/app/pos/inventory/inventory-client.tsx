'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, PackageOpen, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { createInventoryItem } from '../actions'
import { useRouter } from 'next/navigation'

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  cost_per_unit: number;
}

export function InventoryClient({ items }: { items: InventoryItem[] }) {
  
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', unit: '', cost_per_unit: 0, min_quantity: 0, quantity: 0 })

  const handleCreate = async () => {
    setIsSubmitting(true)
    const res = await createInventoryItem(newItem)
    setIsSubmitting(false)
    if (res.success) {
      setIsDialogOpen(false)
      setNewItem({ name: '', unit: '', cost_per_unit: 0, min_quantity: 0, quantity: 0 })
      router.refresh()
    } else {
      alert(res.error)
    }
  }


  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-white border-b p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventario & Insumos</h1>
          <p className="text-slate-500 text-sm">Control de existencias y mermas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex gap-2">
              <Plus className="w-4 h-4" /> Nuevo Insumo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Insumo</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Nombre</label>
                <Input className="col-span-3" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="Ej: Café en grano" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Unidad</label>
                <Input className="col-span-3" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} placeholder="Ej: kg, litro, pza" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Costo unitario</label>
                <Input className="col-span-3" type="number" value={newItem.cost_per_unit} onChange={e => setNewItem({...newItem, cost_per_unit: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Stock Inicial</label>
                <Input className="col-span-3" type="number" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Mínimo</label>
                <Input className="col-span-3" type="number" value={newItem.min_quantity} onChange={e => setNewItem({...newItem, min_quantity: Number(e.target.value)})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="p-6 flex-1 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-slate-100 rounded-full text-slate-600">
                <PackageOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Insumos</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-red-100 rounded-full text-red-600">
                <PackageOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-red-500 font-medium">Alertas de Stock</p>
                <p className="text-2xl font-bold">{items.filter(i => i.quantity <= i.min_quantity).length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-t-lg border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Buscar insumo..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border-x border-b rounded-b-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-4 font-medium text-slate-600 text-sm">Insumo</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Stock Actual</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Mínimo</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Costo Unitario</th>
                <th className="p-4 font-medium text-slate-600 text-sm">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => {
                const isLow = item.quantity <= item.min_quantity
                return (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="p-4 font-medium">{item.name}</td>
                    <td className="p-4">{item.quantity} {item.unit}</td>
                    <td className="p-4 text-slate-500">{item.min_quantity} {item.unit}</td>
                    <td className="p-4 text-slate-500">${Number(item.cost_per_unit).toFixed(2)}</td>
                    <td className="p-4">
                      {isLow ? (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">Bajo Stock</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full">Normal</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No se encontraron insumos.
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
