import { getTables } from './actions'
import TablesClient from './tables-client'

export const dynamic = 'force-dynamic'

export default async function TablesPage() {
  const tables = await getTables()
  return <TablesClient initialTables={tables || []} />
}
