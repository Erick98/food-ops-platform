'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: FormData) {
  const supabase = createClient()
  
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const price = parseFloat(formData.get('price') as string)
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
  if (!profile) return { error: 'No profile' }
  
  const { error } = await supabase.from('products').insert({
    tenant_id: profile.tenant_id,
    name,
    category,
    price,
    is_active: true
  })
  
  if (error) return { error: error.message }
  
  revalidatePath('/pos/menu')
  revalidatePath('/pos') // refresh POS client too
  return { success: true }
}

export async function toggleProductStatus(id: string, currentStatus: boolean) {
  const supabase = createClient()
  const { error } = await supabase.from('products').update({ is_active: !currentStatus }).eq('id', id)
  if (error) return { error: error.message }
  
  revalidatePath('/pos/menu')
  revalidatePath('/pos')
  return { success: true }
}
