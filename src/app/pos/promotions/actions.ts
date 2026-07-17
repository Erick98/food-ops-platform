'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

async function getTenantId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
  return profile?.tenant_id
}

export async function getPromotions() {
  try {
    const supabase = createClient()
    const tenant_id = await getTenantId()
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error: unknown) {
    console.error('Error fetching promotions:', error)
    return { success: false, data: [], error: error instanceof Error ? error.message : String(error) }
  }
}

export async function createPromotion(formData: FormData) {
  try {
    const supabase = createClient()
    const tenant_id = await getTenantId()
    
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const value = parseFloat(formData.get('value') as string)
    
    const time_from = formData.get('time_from') as string || null
    const time_to = formData.get('time_to') as string || null
    const valid_from = formData.get('valid_from') as string || null
    const valid_until = formData.get('valid_until') as string || null
    
    const categoriesStr = formData.get('categories') as string
    const applies_to = categoriesStr ? categoriesStr.split(',').map(s => s.trim()) : []

    const { error } = await supabase
      .from('promotions')
      .insert([{
        tenant_id,
        name,
        type,
        value,
        applies_to,
        time_from,
        time_to,
        valid_from,
        valid_until,
        is_active: true
      }])
      
    if (error) throw error
    
    revalidatePath('/pos/promotions')
    return { success: true }
  } catch (error: unknown) {
    console.error('Error creating promotion:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function togglePromotion(id: string, currentStatus: boolean) {
  try {
    const supabase = createClient()
    const tenant_id = await getTenantId()
    const { error } = await supabase
      .from('promotions')
      .update({ is_active: !currentStatus })
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      
    if (error) throw error
    revalidatePath('/pos/promotions')
    return { success: true }
  } catch (error: unknown) {
    console.error('Error toggling promotion:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
