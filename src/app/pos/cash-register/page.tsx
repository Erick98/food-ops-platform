import { getActiveShift, getDailyCutoff } from '../actions'
import CashRegisterClient from './cash-register-client'

export const dynamic = 'force-dynamic'

export default async function CashRegisterPage() {
  const { data: shift } = await getActiveShift()
  const { data: cutoff } = await getDailyCutoff()
  
  return <CashRegisterClient shift={shift} cutoff={cutoff} />
}
