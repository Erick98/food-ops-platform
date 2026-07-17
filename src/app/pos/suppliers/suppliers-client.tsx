'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { createSupplier, createPurchaseOrder } from '../actions'
import { Plus, Truck, FileText } from 'lucide-react'

export default function SuppliersClient({ 
  initialSuppliers, 
  initialPurchaseOrders 
}: { 
  initialSuppliers: {
    id: string;
    name: string;
    contact_name?: string;
    phone?: string;
    email?: string;
  }[], 
  initialPurchaseOrders: {
    id: string;
    created_at: string;
    supplier?: { name: string };
    total_amount: number;
    status: string;
    notes?: string;
  }[] 
}) {
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false)
  const [isPOModalOpen, setIsPOModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'suppliers'|'orders'>('suppliers')

  const handleCreateSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await createSupplier(formData)
    setIsSupplierModalOpen(false)
  }

  const handleCreatePO = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const supplier_id = formData.get('supplier_id') as string
    const total_amount = parseFloat(formData.get('total_amount') as string)
    const notes = formData.get('notes') as string
    
    await createPurchaseOrder(supplier_id, total_amount, notes)
    setIsPOModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('suppliers')}
          className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'suppliers' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Directorio de Proveedores
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'orders' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Órdenes de Compra (OC)
        </button>
      </div>

      {activeTab === 'suppliers' && (
        <Card>
          <CardHeader className="flex flex-row justify-between items-center bg-white rounded-t-xl">
            <div>
              <CardTitle>Proveedores Registrados</CardTitle>
              <CardDescription>Directorio para abasto de insumos</CardDescription>
            </div>
            <Dialog open={isSupplierModalOpen} onOpenChange={setIsSupplierModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-slate-900 text-white hover:bg-slate-800">
                  <Plus className="w-4 h-4 mr-2" /> Nuevo Proveedor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Proveedor</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSupplier} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="name">Razón Social / Nombre Comercial</Label>
                    <Input id="name" name="name" required placeholder="Ej: Distribuidora Norteña" />
                  </div>
                  <div>
                    <Label htmlFor="contact_name">Nombre de Contacto</Label>
                    <Input id="contact_name" name="contact_name" placeholder="Ej: Juan Pérez" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" name="phone" placeholder="10 dígitos" />
                    </div>
                    <div>
                      <Label htmlFor="email">Correo</Label>
                      <Input id="email" name="email" type="email" placeholder="contacto@empresa.com" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-slate-900 text-white">Guardar Proveedor</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-y">
                <tr>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Contacto</th>
                  <th className="px-6 py-3">Teléfono</th>
                  <th className="px-6 py-3">Correo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {initialSuppliers.map(sup => (
                  <tr key={sup.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium flex items-center gap-2">
                      <Truck className="w-4 h-4 text-slate-400" />
                      {sup.name}
                    </td>
                    <td className="px-6 py-4">{sup.contact_name || '--'}</td>
                    <td className="px-6 py-4">{sup.phone || '--'}</td>
                    <td className="px-6 py-4">{sup.email || '--'}</td>
                  </tr>
                ))}
                {initialSuppliers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No hay proveedores registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'orders' && (
        <Card>
          <CardHeader className="flex flex-row justify-between items-center bg-white rounded-t-xl">
            <div>
              <CardTitle>Historial de Órdenes de Compra</CardTitle>
              <CardDescription>Seguimiento de pedidos a proveedores</CardDescription>
            </div>
            <Dialog open={isPOModalOpen} onOpenChange={setIsPOModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-slate-900 text-white hover:bg-slate-800">
                  <Plus className="w-4 h-4 mr-2" /> Crear OC
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Orden de Compra</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreatePO} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="supplier_id">Proveedor</Label>
                    <select 
                      id="supplier_id" 
                      name="supplier_id" 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Selecciona un proveedor...</option>
                      {initialSuppliers.map(sup => (
                        <option key={sup.id} value={sup.id}>{sup.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="total_amount">Monto Estimado / Total ($)</Label>
                    <Input id="total_amount" name="total_amount" type="number" step="0.01" min="0" required placeholder="Ej: 1500.00" />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notas / Insumos requeridos</Label>
                    <Input id="notes" name="notes" placeholder="Ej: 5kg Arroz, 2kg Frijol" />
                  </div>
                  <Button type="submit" className="w-full bg-slate-900 text-white">Generar OC</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-y">
                <tr>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3">Proveedor</th>
                  <th className="px-6 py-3">Monto</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {initialPurchaseOrders.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      {new Date(po.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium">{po.supplier?.name || 'Desconocido'}</td>
                    <td className="px-6 py-4">${po.total_amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={po.status === 'draft' ? 'outline' : 'default'} className="capitalize">
                        {po.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate">{po.notes || '--'}</td>
                  </tr>
                ))}
                {initialPurchaseOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No hay órdenes de compra registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
