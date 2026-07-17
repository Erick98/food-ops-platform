import KDSClient from './kds-client'
import { getActiveOrders } from '../actions'

export const dynamic = 'force-dynamic'

export default async function KDSPage() {
  const { data: initialOrders } = await getActiveOrders()

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white p-4">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Kitchen Display System</h1>
          <p className="text-slate-400 text-sm">Monitor de Comandas - Ito Café</p>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-lg text-lg font-mono text-emerald-400 font-bold border border-slate-700">
          {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </header>
      
      <div className="flex-1 overflow-x-auto pb-4">
        <KDSClient initialActiveOrders={initialOrders || []} />
      </div>
    </div>
  )
}
