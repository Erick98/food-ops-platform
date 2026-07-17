import { getDashboardMetrics } from '../actions'
import DashboardClient  from './dashboard-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { data: metrics } = await getDashboardMetrics()
  return <DashboardClient metrics={metrics} />
}
