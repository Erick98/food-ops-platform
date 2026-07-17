import { getInventory, getMermas } from '../actions'
import { WastageClient } from './wastage-client'

export const dynamic = 'force-dynamic'

export default async function WastagePage() {
  const { data: inventory } = await getInventory()
  const { data: mermas } = await getMermas()

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <WastageClient inventory={inventory || []} mermas={mermas || []} />
    </div>
  )
}
