import { getDeliveryPlatforms, getDeliveryOrders } from "@/lib/actions/delivery"
import { DeliveryClient } from "./delivery-client"

export const metadata = {
  title: "Delivery & Integraciones - Food-Ops",
  description: "Gestión de plataformas de delivery y pedidos externos.",
}

export default async function DeliveryPage() {
  const platforms = await getDeliveryPlatforms()
  const orders = await getDeliveryOrders()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Delivery & Integraciones</h2>
      </div>
      <DeliveryClient initialPlatforms={platforms} initialOrders={orders} />
    </div>
  )
}
