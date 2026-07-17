import { getDailyCutoff } from '../actions'
import { ReportsClient } from './reports-client'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const { data: cutoff } = await getDailyCutoff()
  return <ReportsClient cutoff={cutoff} />
}
