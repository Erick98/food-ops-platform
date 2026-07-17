import { getBranchSettings } from "./actions"
import { SettingsClient } from "./settings-client"

export const metadata = {
  title: "Configuración de Sucursal - Food-Ops",
  description: "Ajusta IVA, horarios, datos fiscales e impresora por sucursal.",
}

export default async function SettingsPage() {
  const settings = await getBranchSettings()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Configuración de Sucursal</h2>
      </div>
      <SettingsClient initialSettings={settings} />
    </div>
  )
}
