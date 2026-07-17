import { getInvoices, getInvoiceSummary, createInvoice } from "./actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText, CheckCircle, Clock, XCircle, DollarSign, Plus } from "lucide-react"

const USO_CFDI_OPTIONS = [
  { value: "G01", label: "G01 – Adquisición de mercancias" },
  { value: "G02", label: "G02 – Devoluciones, descuentos o bonificaciones" },
  { value: "G03", label: "G03 – Gastos en general" },
  { value: "I01", label: "I01 – Construcciones" },
  { value: "D01", label: "D01 – Honorarios médicos, dentales y gastos hospitalarios" },
  { value: "S01", label: "S01 – Sin efectos fiscales" },
]

const REGIMEN_FISCAL_OPTIONS = [
  { value: "601", label: "601 – General de Ley Personas Morales" },
  { value: "603", label: "603 – Personas Morales con Fines no Lucrativos" },
  { value: "605", label: "605 – Sueldos y Salarios e Ingresos Asimilados a Salarios" },
  { value: "606", label: "606 – Arrendamiento" },
  { value: "608", label: "608 – Demás ingresos" },
  { value: "612", label: "612 – Personas Físicas con Actividades Empresariales" },
  { value: "616", label: "616 – Sin obligaciones fiscales" },
  { value: "621", label: "621 – Incorporación Fiscal" },
  { value: "625", label: "625 – Régimen de las Actividades Empresariales con ingresos por Comisión" },
  { value: "626", label: "626 – Régimen Simplificado de Confianza – RESICO" },
]

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  draft:     { label: "Borrador",   className: "bg-slate-100 text-slate-700",   icon: Clock },
  sent:      { label: "Enviada",    className: "bg-blue-100 text-blue-700",     icon: FileText },
  stamped:   { label: "Timbrada",   className: "bg-green-100 text-green-700",   icon: CheckCircle },
  cancelled: { label: "Cancelada",  className: "bg-red-100 text-red-600",       icon: XCircle },
  error:     { label: "Error",      className: "bg-orange-100 text-orange-700", icon: XCircle },
}

function formatMXN(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount)
}

export default async function InvoicesPage() {
  const [invoices, summary] = await Promise.all([getInvoices(), getInvoiceSummary()])

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
        <p className="text-muted-foreground">Gestiona las facturas CFDI de tus órdenes.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg"><FileText className="w-5 h-5 text-slate-600" /></div>
              <div>
                <p className="text-2xl font-bold">{summary.total}</p>
                <p className="text-sm text-muted-foreground">Total facturas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
              <div>
                <p className="text-2xl font-bold">{summary.stamped}</p>
                <p className="text-sm text-muted-foreground">Timbradas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg"><Clock className="w-5 h-5 text-slate-500" /></div>
              <div>
                <p className="text-2xl font-bold">{summary.draft}</p>
                <p className="text-sm text-muted-foreground">Borradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
              <div>
                <p className="text-2xl font-bold">{formatMXN(summary.totalAmount)}</p>
                <p className="text-sm text-muted-foreground">Monto timbrado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Plus className="w-4 h-4" /> Nueva Factura</CardTitle>
              <CardDescription>Genera una factura vinculada a una orden existente.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createInvoice} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">ID de Orden *</label>
                  <input
                    type="text"
                    name="order_id"
                    required
                    placeholder="UUID de la orden"
                    className="w-full border rounded p-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">RFC *</label>
                  <input
                    type="text"
                    name="rfc"
                    required
                    maxLength={13}
                    placeholder="XAXX010101000"
                    className="w-full border rounded p-2 text-sm uppercase"
                  />
                  <p className="text-xs text-muted-foreground mt-1">RFC del receptor (persona física o moral)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Razón Social *</label>
                  <input
                    type="text"
                    name="razon_social"
                    required
                    placeholder="Nombre o empresa"
                    className="w-full border rounded p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Uso de CFDI</label>
                  <select name="uso_cfdi" className="w-full border rounded p-2 text-sm">
                    {USO_CFDI_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Régimen Fiscal</label>
                  <select name="regimen_fiscal" className="w-full border rounded p-2 text-sm">
                    {REGIMEN_FISCAL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subtotal (antes de IVA) *</label>
                  <input
                    type="number"
                    name="subtotal"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full border rounded p-2 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">IVA 16% se calcula automáticamente</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ID Cliente (opcional)</label>
                  <input
                    type="text"
                    name="customer_id"
                    placeholder="UUID del cliente en CRM"
                    className="w-full border rounded p-2 text-sm font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground rounded p-2 font-medium hover:bg-primary/90 mt-2"
                >
                  Generar Factura (Borrador)
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Facturas</CardTitle>
              <CardDescription>Últimas 100 facturas emitidas</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-2 font-medium">Receptor</th>
                        <th className="pb-2 font-medium">RFC</th>
                        <th className="pb-2 font-medium">Total</th>
                        <th className="pb-2 font-medium">Estado</th>
                        <th className="pb-2 font-medium">UUID SAT</th>
                        <th className="pb-2 font-medium">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {invoices.map((inv) => {
                        const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.draft
                        const Icon = cfg.icon
                        return (
                          <tr key={inv.id} className="hover:bg-muted/50">
                            <td className="py-3 font-medium max-w-[160px] truncate">
                              {inv.razon_social}
                            </td>
                            <td className="py-3 font-mono text-xs">{inv.rfc}</td>
                            <td className="py-3 font-semibold">{formatMXN(inv.total)}</td>
                            <td className="py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                                <Icon className="w-3 h-3" />
                                {cfg.label}
                              </span>
                            </td>
                            <td className="py-3 font-mono text-xs text-muted-foreground max-w-[100px] truncate">
                              {inv.cfdi_uuid ?? "—"}
                            </td>
                            <td className="py-3 text-muted-foreground text-xs">
                              {new Date(inv.created_at).toLocaleDateString("es-MX")}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Sin facturas aún. Genera la primera desde el formulario.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
