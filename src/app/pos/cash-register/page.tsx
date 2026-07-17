import { CashRegisterClient } from './cash-register-client'
import { getActiveShift, getDailyCutoff } from '../actions'

export const metadata = {
  title: 'Turnos de Caja | Food-Ops Platform',
  description: 'Gestión de aperturas y cierres de caja',
}

export default async function CashRegisterPage() {
  const { data: activeShift } = await getActiveShift()
  const { data: salesToday } = await getDailyCutoff()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Arqueo de Caja</h1>
        <p className="text-muted-foreground">Gestiona la apertura y cierre de turnos</p>
      </div>

      <CashRegisterClient initialShift={activeShift} salesToday={salesToday} />
    </div>
  )
}
