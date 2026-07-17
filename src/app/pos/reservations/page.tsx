import { getReservations } from '../actions'
import ReservationsClient from './ReservationsClient'

export const metadata = {
  title: 'Reservaciones | Plataforma Restaurantes',
}

export default async function ReservationsPage() {
  const reservations = await getReservations()

  return (
    <div className="p-6">
      <ReservationsClient initialReservations={reservations} />
    </div>
  )
}
