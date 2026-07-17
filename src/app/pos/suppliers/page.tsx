import { getSuppliers, getPurchaseOrders } from '../actions'
import SuppliersClient from './suppliers-client'

export default async function SuppliersPage() {
  const suppliers = await getSuppliers()
  const purchaseOrders = await getPurchaseOrders()

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Proveedores y Órdenes de Compra</h1>
          <p className="text-slate-500 text-sm">Gestiona tus abastecimientos y vincula inventario</p>
        </div>
      </header>
      <main className="flex-1 p-6 overflow-auto">
        <SuppliersClient initialSuppliers={suppliers} initialPurchaseOrders={purchaseOrders} />
      </main>
    </div>
  )
}
