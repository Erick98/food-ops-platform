'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, Clock, Users, Phone, CheckCircle2 } from 'lucide-react'
import { createReservation, updateReservationStatus, type Reservation } from '../actions'

export default function ReservationsClient({ initialReservations }: { initialReservations: Reservation[] }) {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    party_size: 2,
    date: '',
    time: '',
    notes: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = async () => {
    setIsLoading(true)
    const datetime = new Date(`${formData.date}T${formData.time}`).toISOString()
    const res = await createReservation({
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      party_size: formData.party_size,
      reservation_time: datetime,
      status: 'pending',
      notes: formData.notes
    })
    if (res.success) {
      setIsModalOpen(false)
      window.location.reload()
    } else {
      alert("Error: " + res.error)
    }
    setIsLoading(false)
  }

  const handleUpdateStatus = async (id: string, status: Reservation['status']) => {
    const res = await updateReservationStatus(id, status)
    if (res.success) {
      setReservations(reservations.map(r => r.id === id ? { ...r, status } : r))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'seated': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no_show': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const pendingCount = reservations.filter(r => r.status === 'pending').length
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length
  const seatedCount = reservations.filter(r => r.status === 'seated').length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reservaciones</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Reservación
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Confirmadas</p>
              <p className="text-2xl font-bold">{confirmedCount}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sentados (Seated)</p>
              <p className="text-2xl font-bold">{seatedCount}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Reservaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reservations.length === 0 ? (
              <p className="text-muted-foreground">No hay reservaciones registradas.</p>
            ) : (
              reservations.map((res) => (
                <div key={res.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg">
                  <div className="flex flex-col gap-1 mb-4 md:mb-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{res.customer_name}</span>
                      <Badge className={getStatusColor(res.status)}>
                        {res.status === 'no_show' ? 'No Show' : res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4"/> {new Date(res.reservation_time).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4"/> {new Date(res.reservation_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className="flex items-center gap-1"><Users className="h-4 w-4"/> {res.party_size} px</span>
                      {res.customer_phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4"/> {res.customer_phone}</span>}
                    </div>
                    {res.notes && <p className="text-sm italic text-muted-foreground mt-1">Nota: {res.notes}</p>}
                  </div>

                  <div className="flex gap-2">
                    {res.status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(res.id, 'confirmed')} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                        Confirmar
                      </Button>
                    )}
                    {(res.status === 'pending' || res.status === 'confirmed') && (
                      <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(res.id, 'seated')} className="text-green-600 border-green-200 hover:bg-green-50">
                        Sentar
                      </Button>
                    )}
                    {res.status !== 'cancelled' && res.status !== 'seated' && (
                      <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(res.id, 'cancelled')} className="text-red-600 border-red-200 hover:bg-red-50">
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nueva Reservación</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Cliente</label>
                <Input value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} placeholder="Ej. Maria Lopez" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono (Opcional)</label>
                <Input value={formData.customer_phone} onChange={e => setFormData({...formData, customer_phone: e.target.value})} placeholder="55 1234 5678" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Personas</label>
                  <Input type="number" min="1" value={formData.party_size} onChange={e => setFormData({...formData, party_size: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha</label>
                  <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hora</label>
                <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notas (Opcional)</label>
                <Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Aniversario, silla de ruedas..." />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={isLoading || !formData.customer_name || !formData.date || !formData.time}>
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
