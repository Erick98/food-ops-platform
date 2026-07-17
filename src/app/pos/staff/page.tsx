import { getStaff } from '../actions'
import StaffClient from './staff-client'

export const dynamic = 'force-dynamic'

export default async function StaffPage() {
  const { data: staffList } = await getStaff()

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">Personal</h1>
          <p className="text-slate-500 text-sm">Gestión de turnos y roles del equipo</p>
        </div>
      </header>
      
      <div className="flex-1 bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <StaffClient initialStaff={staffList || []} />
      </div>
    </div>
  )
}
