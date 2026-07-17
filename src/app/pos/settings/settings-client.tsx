"use client"

import { useState } from "react"
import { Save, Clock, BadgeDollarSign, Printer, Phone, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { saveBranchSettings } from "./actions"

interface BranchSettings {
  iva_rate?: number | null
  include_iva_in_price?: boolean | null
  rfc?: string | null
  razon_social?: string | null
  regimen_fiscal?: string | null
  open_time?: string | null
  close_time?: string | null
  currency?: string | null
  ticket_footer?: string | null
  print_logo?: boolean | null
  printer_ip?: string | null
  phone?: string | null
  address?: string | null
  website?: string | null
  instagram?: string | null
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const DAYS_ES: Record<string, string> = {
  Mon: "Lun", Tue: "Mar", Wed: "Mié", Thu: "Jue", Fri: "Vie", Sat: "Sáb", Sun: "Dom",
}

export function SettingsClient({ initialSettings }: { initialSettings: BranchSettings | null }) {
  const s = initialSettings ?? {}
  const [isSaving, setIsSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [includeIva, setIncludeIva] = useState(s.include_iva_in_price ?? false)
  const [printLogo, setPrintLogo] = useState(s.print_logo ?? true)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setSavedOk(false)
    setSaveError(null)
    try {
      const formData = new FormData(e.currentTarget)
      formData.set("include_iva_in_price", includeIva ? "true" : "false")
      formData.set("print_logo", printLogo ? "true" : "false")
      await saveBranchSettings(formData)
      setSavedOk(true)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar configuración")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="fiscal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fiscal">
            <BadgeDollarSign className="mr-2 h-4 w-4" /> Fiscal
          </TabsTrigger>
          <TabsTrigger value="horario">
            <Clock className="mr-2 h-4 w-4" /> Horario
          </TabsTrigger>
          <TabsTrigger value="impresora">
            <Printer className="mr-2 h-4 w-4" /> Impresora / Ticket
          </TabsTrigger>
          <TabsTrigger value="contacto">
            <Phone className="mr-2 h-4 w-4" /> Contacto
          </TabsTrigger>
        </TabsList>

        {/* ─── FISCAL ─── */}
        <TabsContent value="fiscal">
          <Card>
            <CardHeader>
              <CardTitle>Configuración Fiscal</CardTitle>
              <CardDescription>IVA, RFC y datos para facturación CFDI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="iva_rate">Tasa IVA (%)</Label>
                  <Input id="iva_rate" name="iva_rate" type="number" step="0.01" defaultValue={s.iva_rate ?? 16} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Input id="currency" name="currency" defaultValue={s.currency ?? "MXN"} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="include_iva" checked={includeIva} onCheckedChange={setIncludeIva} />
                <Label htmlFor="include_iva">Precios incluyen IVA (precio final = precio ingresado)</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rfc">RFC de la sucursal</Label>
                  <Input id="rfc" name="rfc" defaultValue={s.rfc ?? ""} placeholder="XAXX010101000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razon_social">Razón Social</Label>
                  <Input id="razon_social" name="razon_social" defaultValue={s.razon_social ?? ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="regimen_fiscal">Régimen Fiscal</Label>
                <Input id="regimen_fiscal" name="regimen_fiscal" defaultValue={s.regimen_fiscal ?? "616"} placeholder="ej. 616 – Sin obligaciones fiscales" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── HORARIO ─── */}
        <TabsContent value="horario">
          <Card>
            <CardHeader>
              <CardTitle>Horarios de Operación</CardTitle>
              <CardDescription>Define cuándo está abierto el negocio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="open_time">Hora de apertura</Label>
                  <Input id="open_time" name="open_time" type="time" defaultValue={s.open_time ?? "08:00"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="close_time">Hora de cierre</Label>
                  <Input id="close_time" name="close_time" type="time" defaultValue={s.close_time ?? "22:00"} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Días de apertura</Label>
                <div className="flex gap-2">
                  {DAYS.map(d => (
                    <label key={d} className="flex flex-col items-center gap-1 cursor-pointer">
                      <input type="checkbox" name="days_open" value={d} className="accent-slate-900" defaultChecked={d !== "Sun"} />
                      <span className="text-xs">{DAYS_ES[d]}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── IMPRESORA / TICKET ─── */}
        <TabsContent value="impresora">
          <Card>
            <CardHeader>
              <CardTitle>Impresora & Ticket</CardTitle>
              <CardDescription>Configura la impresora térmica y pie de ticket.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="printer_ip">IP de Impresora Térmica</Label>
                <Input id="printer_ip" name="printer_ip" defaultValue={s.printer_ip ?? ""} placeholder="192.168.1.100" />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="print_logo" checked={printLogo} onCheckedChange={setPrintLogo} />
                <Label htmlFor="print_logo">Imprimir logo en ticket</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket_footer">
                  <FileText className="inline mr-1 h-4 w-4" />
                  Pie del ticket
                </Label>
                <Input
                  id="ticket_footer"
                  name="ticket_footer"
                  defaultValue={s.ticket_footer ?? "Gracias por su visita."}
                  placeholder="Gracias por su visita."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── CONTACTO ─── */}
        <TabsContent value="contacto">
          <Card>
            <CardHeader>
              <CardTitle>Datos de Contacto</CardTitle>
              <CardDescription>Teléfono, dirección y redes sociales.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" name="phone" defaultValue={s.phone ?? ""} placeholder="+52 33 0000 0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input id="website" name="website" defaultValue={s.website ?? ""} placeholder="https://itocafe.mx" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" name="address" defaultValue={s.address ?? ""} placeholder="Calle, Colonia, Ciudad, CP" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" name="instagram" defaultValue={s.instagram ?? ""} placeholder="@itocafe.mx" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex items-center gap-4">
        <Button type="submit" disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar Configuración"}
        </Button>
        {savedOk && <span className="text-sm text-green-600 font-medium">✓ Configuración guardada</span>}
        {saveError && <span className="text-sm text-red-600">{saveError}</span>}
      </div>
    </form>
  )
}
