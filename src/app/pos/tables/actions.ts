'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type Table = {
  id: string
  tenant_id: string
  name: string
  zone: string
  capacity: number
  status: 'free' | 'occupied' | 'dirty'
  current_order_id: string | null
  created_at: string
  updated_at: string
}

const mockTables: Table[] = [
  { id: '1', tenant_id: 'mock-tenant', name: 'Mesa 1', zone: 'Terraza', capacity: 2, status: 'free', current_order_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', tenant_id: 'mock-tenant', name: 'Mesa 2', zone: 'Terraza', capacity: 4, status: 'occupied', current_order_id: 'order-123', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', tenant_id: 'mock-tenant', name: 'Mesa 3', zone: 'Salón', capacity: 2, status: 'dirty', current_order_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', tenant_id: 'mock-tenant', name: 'Barra 1', zone: 'Barra', capacity: 1, status: 'free', current_order_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export async function getTables(): Promise<Table[]> {
  try {
    const supabase = createClient()
    const { data: user, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user?.user) {
      return mockTables
    }

    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('zone', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching tables:', error)
      return mockTables
    }

    return data as Table[] || []
  } catch (err) {
    console.error(err)
    return mockTables
  }
}

export async function createTable(formData: FormData) {
  try {
    const supabase = createClient()
    const { data: user } = await supabase.auth.getUser()
    
    const name = formData.get('name') as string
    const zone = formData.get('zone') as string
    const capacity = parseInt(formData.get('capacity') as string || '2', 10)

    if (user?.user) {
      const tenant_id = user.user.user_metadata.tenant_id
      const { error } = await supabase
        .from('tables')
        .insert([{ tenant_id, name, zone, capacity }])
        
      if (error) throw error
    } else {
      console.log('Mock create table:', { name, zone, capacity })
    }
    
    revalidatePath('/pos/tables')
    return { success: true }
  } catch (err: unknown) {
    console.error('Error creating table:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function updateTableStatus(id: string, status: 'free' | 'occupied' | 'dirty', current_order_id: string | null = null) {
  try {
    const supabase = createClient()
    const { data: user } = await supabase.auth.getUser()

    if (user?.user) {
      const { error } = await supabase
        .from('tables')
        .update({ status, current_order_id })
        .eq('id', id)
        
      if (error) throw error
    } else {
      console.log('Mock update table:', { id, status, current_order_id })
    }
    
    revalidatePath('/pos/tables')
    return { success: true }
  } catch (err: unknown) {
    console.error('Error updating table:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
