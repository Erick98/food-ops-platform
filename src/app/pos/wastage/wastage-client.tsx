'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { createMerma } from '../actions'
import { useRouter } from 'next/navigation'

type InventoryItem = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  cost_per_unit: number;
}

type MermaItem = {
  id: string;
  quantity_lost: number;
  cost_value: number;
  reason: string;
  created_at: string;
  inventory_items?: { name: string; unit: string } | { name: string; unit: string }[];
}

export function WastageClient({ inventory, mermas }: { inventory: InventoryItem[], mermas: MermaItem[] }) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [selectedItemId, setSelectedItemId] = useState('')
  const [quantity, setQuantity] = useState<number | ''>('')
  const [reason, setReason] = useState('')

  const handleCreate = async () => {
    if (!selectedItemId || !quantity || !reason) {
      alert("Por favor completa todos los campos.")
      return
    }

    const item = inventory.find(i => i.id === selectedItemId)
    if (!item) return

    const q = Number(quantity)
    const costValue = q * item.cost_per_unit

    setIsSubmitting(true)
    const res = await createMerma({
      inventory_item_id: selectedItemId,
      quantity_lost: q,
      cost_value: costValue,
      reason
    })
    setIsSubmitting(false)

    if (res.success) {
      setIsDialogOpen(false)
      setSelectedItemId('')
      setQuantity('')
      setReason('')
      router.refresh()
    } else {
      alert(res.error)
    }
  }

  const totalCostLost = mermas.reduce((acc, m) => acc + Number(m.cost_value), 0)

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 overflow-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Control de Mermas</h1>
          <p className="text-slate-500 text-sm">Registro de insumos perdidos, caducados o dañados</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex gap-2 bg-red-600 hover:bg-red-700 text-white">
              <Plus className="w-4 h-4" /> Registrar Merma
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nueva Merma</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Insumo</label>
                <select 
                  className="col-span-3 border rounded px-3 py-2 text-sm text-slate-900"
                  value={selectedItemId}
                  onChange={e => setSelectedItemId(e.target.value)}
                >
                  <option value="">Selecciona un insumo...</option>
                  {inventory.map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.name} (Stock: {inv.quantity} {inv.unit})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Cantidad</label>
                <Input 
                  className="col-span-3" 
                  type="number" 
                  step="0.01"
                  value={quantity} 
                  onChange={e => setQuantity(e.target.value ? Number(e.target.value) : '')} 
                  placeholder="Ej: 2.5" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Motivo</label>
                <Input 
                  className="col-span-3" 
                  value={reason} 
                  onChange={e => setReason(e.target.value)} 
                  placeholder="Ej: Caducidad, Caída, Error preparación" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white">
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Registrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-red-200 bg-red-50/40">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-red-100 rounded-full text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Costo Total Perdido</p>
              <p className="text-2xl font-bold text-red-700">${totalCostLost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden flex-1 flex flex-col">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-4 font-medium text-slate-600 text-sm">Fecha/Hora</th>
              <th className="p-4 font-medium text-slate-600 text-sm">Insumo</th>
              <th className="p-4 font-medium text-slate-600 text-sm">Cantidad Perdida</th>
              <th className="p-4 font-medium text-slate-600 text-sm">Costo</th>
              <th className="p-4 font-medium text-slate-600 text-sm">Motivo</th>
            </tr>
          </thead>
          <tbody className="overflow-y-auto">
            {mermas.map(merma => {
              const invItem = Array.isArray(merma.inventory_items) ? merma.inventory_items[0] : merma.inventory_items;
              const name = invItem ? invItem.name : 'Desconocido'
              const unit = invItem ? invItem.unit : ''
              const dateObj = new Date(merma.created_at)
              const formattedDate = dateObj.toLocaleDateString('es-MX', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })

              return (
                <tr key={merma.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="p-4 text-slate-500 text-sm">{formattedDate}</td>
                  <td className="p-4 font-medium">{name}</td>
                  <td className="p-4 text-red-600 font-medium">{merma.quantity_lost} {unit}</td>
                  <td className="p-4 text-slate-600">${Number(merma.cost_value).toFixed(2)}</td>
                  <td className="p-4 text-slate-600">{merma.reason}</td>
                </tr>
              )
            })}
            {mermas.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No hay mermas registradas. ¡Buen trabajo!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
