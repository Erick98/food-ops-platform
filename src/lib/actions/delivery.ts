"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"

export async function getDeliveryPlatforms() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("delivery_platforms")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching delivery platforms:", error)
    return []
  }

  return data
}

export async function createDeliveryPlatform(formData: FormData) {
  const supabase = createClient()
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData?.user) throw new Error("Unauthorized")

  // Fetch user profile to get tenant_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", userData.user.id)
    .single()

  if (!profile) throw new Error("Profile not found")

  const name = formData.get("name") as string
  const commission_rate = parseFloat(formData.get("commission_rate") as string || "0")
  const api_key = formData.get("api_key") as string | null

  const { error } = await supabase.from("delivery_platforms").insert({
    tenant_id: profile.tenant_id,
    name,
    commission_rate,
    api_key
  })

  if (error) {
    console.error("Error creating delivery platform:", error)
    throw new Error(error.message)
  }

  revalidatePath("/pos/delivery")
}

export async function togglePlatformStatus(id: string, currentStatus: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from("delivery_platforms")
    .update({ is_active: !currentStatus })
    .eq("id", id)

  if (error) {
    console.error("Error toggling platform status:", error)
    throw new Error(error.message)
  }

  revalidatePath("/pos/delivery")
}

export async function getDeliveryOrders() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      delivery_platform:delivery_platforms(name)
    `)
    .not("delivery_platform_id", "is", null)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching delivery orders:", error)
    return []
  }

  return data
}
