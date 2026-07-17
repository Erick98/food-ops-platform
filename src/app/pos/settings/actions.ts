"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"

interface BranchSettings {
  iva_rate: number
  include_iva_in_price: boolean
  rfc?: string | null
  razon_social?: string | null
  regimen_fiscal?: string | null
  open_time?: string | null
  close_time?: string | null
  days_open?: string[]
  currency: string
  ticket_footer?: string | null
  print_logo: boolean
  printer_ip?: string | null
  phone?: string | null
  address?: string | null
  website?: string | null
  instagram?: string | null
}

export async function getBranchSettings(): Promise<BranchSettings | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("branch_settings")
    .select("*")
    .single()

  if (error) {
    // May not exist yet; return null so UI shows defaults
    return null
  }

  return data as BranchSettings
}

export async function saveBranchSettings(formData: FormData) {
  const supabase = createClient()
  const { data: userData, error: authError } = await supabase.auth.getUser()
  if (authError || !userData?.user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role")
    .eq("id", userData.user.id)
    .single()

  if (!profile) throw new Error("Profile not found")
  if (!["admin", "manager"].includes(profile.role)) throw new Error("No tienes permiso para cambiar la configuración")

  const payload = {
    tenant_id: profile.tenant_id,
    iva_rate: parseFloat(formData.get("iva_rate") as string || "16"),
    include_iva_in_price: formData.get("include_iva_in_price") === "true",
    rfc: formData.get("rfc") as string || null,
    razon_social: formData.get("razon_social") as string || null,
    regimen_fiscal: formData.get("regimen_fiscal") as string || null,
    open_time: formData.get("open_time") as string || "08:00",
    close_time: formData.get("close_time") as string || "22:00",
    currency: formData.get("currency") as string || "MXN",
    ticket_footer: formData.get("ticket_footer") as string || null,
    print_logo: formData.get("print_logo") === "true",
    printer_ip: formData.get("printer_ip") as string || null,
    phone: formData.get("phone") as string || null,
    address: formData.get("address") as string || null,
    website: formData.get("website") as string || null,
    instagram: formData.get("instagram") as string || null,
  }

  const { error: upsertError } = await supabase
    .from("branch_settings")
    .upsert(payload, { onConflict: "tenant_id" })

  if (upsertError) {
    console.error("Error saving branch settings:", upsertError)
    throw new Error(upsertError.message)
  }

  revalidatePath("/pos/settings")
}
