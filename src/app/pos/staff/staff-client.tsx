'use client'

import { useState } from 'react'
import { createStaff } from '../actions'

type StaffRole = 'admin' | 'manager' | 'cashier' | 'kitchen'

interface StaffMember {
  id: string
  full_name: string
  role: StaffRole
  email: string
  created_at?: string
}

export default function StaffClient({ initialStaff }: { initialStaff: StaffMember[] }) {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({ role: 'cashier' })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'cashier': return 'bg-green-100 text-green-800'
      case 'kitchen': return 'bg-orange-100 text-orange-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const roleNames = {
    admin: 'Administrador',
    manager: 'Gerente',
    cashier: 'Cajero / Piso',
    kitchen: 'Cocina / Barra'
  }

  const handleSave = async () => {
    if (!newStaff.full_name || !newStaff.email) return;
    
    // Call server action (for now it returns success:true as mock for production API)
    await createStaff(newStaff)
    
    // Optimistic update
    const newId = `temp-${Date.now()}`
    setStaff([...staff, { ...newStaff, id: newId } as StaffMember])
    setIsModalOpen(false)
    setNewStaff({ role: 'cashier' })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center bg-white">
        <input 
          type="text" 
          placeholder="Buscar personal..." 
          className="border rounded px-3 py-2 text-sm w-64"
        />
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium"
        >
          + Agregar Personal
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Correo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {staff.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                      {member.full_name.charAt(0)}
                    </div>
                    <div className="text-sm font-medium text-slate-900">{member.full_name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {member.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(member.role)}`}>
                    {roleNames[member.role] || member.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                  <button className="text-red-600 hover:text-red-900">Suspender</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium">Agregar Miembro del Equipo</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={newStaff.full_name || ''}
                  onChange={e => setNewStaff({...newStaff, full_name: e.target.value})}
                  className="w-full border rounded px-3 py-2" 
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={newStaff.email || ''}
                  onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                  className="w-full border rounded px-3 py-2" 
                  placeholder="juan@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select 
                  className="w-full border rounded px-3 py-2"
                  value={newStaff.role}
                  onChange={e => setNewStaff({...newStaff, role: e.target.value as StaffRole})}
                >
                  <option value="cashier">Cajero / Piso</option>
                  <option value="kitchen">Cocina / Barra</option>
                  <option value="manager">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end space-x-3 rounded-b-lg">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                disabled={!newStaff.full_name || !newStaff.email}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
