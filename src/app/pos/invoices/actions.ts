"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// ─── Types ────────────────────────────────────────────────────────────────────
export type Invoice = {
  id: string
  tenant_id: string
  order_id: string
  customer_id?: string | null
  rfc: string
  razon_social: string
  uso_cfdi: string
  regimen_fiscal: string
  cfdi_uuid?: string | null
  serie?: string | null
  folio?: number | null
  subtotal: number
  tax_amount: number
  total: number
  currency: string
  status: "draft" | "sent" | "stamped" | "cancelled" | "error"
  pdf_url?: string | null
  xml_url?: string | null
  error_message?: string | null
  emitted_at?: string | null
  created_at: string
  updated_at: string
  // joined
  orders?: { id: string; created_at: string; total_amount: number } | null
  customers?: { id: string; first_name: string; last_name?: string | null } | null
}

function makeClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
}

// ─── Queries ──────────────────────────────────────────────────────────────────
export async function getInvoices(): Promise<Invoice[]> {
  const supabase = makeClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return []

  const { data, error } = await supabase
    .from("invoices")
    .select("*, orders(id, created_at, total_amount), customers(id, first_name, last_name)")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("getInvoices error:", error)
    return []
  }
  return (data ?? []) as Invoice[]
}

export async function getInvoiceSummary() {
  const supabase = makeClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { total: 0, stamped: 0, draft: 0, cancelled: 0, totalAmount: 0 }

  const { data } = await supabase
    .from("invoices")
    .select("status, total")

  if (!data) return { total: 0, stamped: 0, draft: 0, cancelled: 0, totalAmount: 0 }

  return {
    total: data.length,
    stamped: data.filter((i) => i.status === "stamped").length,
    draft: data.filter((i) => i.status === "draft").length,
    cancelled: data.filter((i) => i.status === "cancelled").length,
    totalAmount: data
      .filter((i) => i.status === "stamped")
      .reduce((sum, i) => sum + Number(i.total), 0),
  }
}

// ─── Mutations ────────────────────────────────────────────────────────────────
export async function createInvoice(formData: FormData): Promise<void> {
  const supabase = makeClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) redirect("/login")

  const tenant_id = userData.user.user_metadata?.tenant_id
  if (!tenant_id) return

  const order_id      = formData.get("order_id")?.toString()
  const rfc           = formData.get("rfc")?.toString()?.toUpperCase().trim()
  const razon_social  = formData.get("razon_social")?.toString()?.trim()
  const uso_cfdi      = formData.get("uso_cfdi")?.toString() ?? "G03"
  const regimen_fiscal = formData.get("regimen_fiscal")?.toString() ?? "616"
  const subtotal      = parseFloat(formData.get("subtotal")?.toString() ?? "0")
  const tax_rate      = 0.16
  const tax_amount    = Math.round(subtotal * tax_rate * 100) / 100
  const total         = Math.round((subtotal + tax_amount) * 100) / 100
  const customer_id   = formData.get("customer_id")?.toString() || null

  if (!order_id || !rfc || !razon_social) {
    console.error("Faltan campos obligatorios")
    return
  }

  // Basic RFC validation
  const rfcRegex = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/
  if (!rfcRegex.test(rfc)) {
    console.error(`RFC inválido: ${rfc}`)
    return
  }

  const { error } = await supabase.from("invoices").insert({
    tenant_id,
    order_id,
    customer_id,
    rfc,
    razon_social,
    uso_cfdi,
    regimen_fiscal,
    subtotal,
    tax_amount,
    total,
    currency: "MXN",
    status: "draft",
  })

  if (error) {
    console.error("createInvoice error:", error)
    return
  }

  revalidatePath("/pos/invoices")
}

export async function cancelInvoice(invoiceId: string) {
  const supabase = makeClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: "No autenticado" }

  const { error } = await supabase
    .from("invoices")
    .update({ status: "cancelled" })
    .eq("id", invoiceId)

  if (error) return { error: error.message }

  revalidatePath("/pos/invoices")
  return { success: true }
}

export async function markStamped(invoiceId: string, cfdi_uuid: string) {
  const supabase = makeClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: "No autenticado" }

  const { error } = await supabase
    .from("invoices")
    .update({
      status: "stamped",
      cfdi_uuid,
      emitted_at: new Date().toISOString(),
    })
    .eq("id", invoiceId)

  if (error) return { error: error.message }

  revalidatePath("/pos/invoices")
  return { success: true }
}
