export const dynamic = 'force-dynamic'

import { getPromotions } from './actions'
import { PromotionsClient } from './promotions-client'

export default async function PromotionsPage() {
  const { data: promotions } = await getPromotions()

  return <PromotionsClient initialPromos={promotions || []} />
}
