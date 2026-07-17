'use server'

import { createClient } from '@/utils/supabase/server'

const mockTables = [
  { id: '1', name: 'Mesa 1', zone: 'Salón Principal', capacity: 4, status: 'free' },
  { id: '2', name: 'Mesa 2', zone: 'Salón Principal', capacity: 2, status: 'occupied' },
  { id: '3', name: 'Mesa 3', zone: 'Salón Principal', capacity: 6, status: 'dirty' },
  { id: '4', name: 'Terraza 1', zone: 'Terraza', capacity: 4, status: 'free' },
  { id: '5', name: 'Terraza 2', zone: 'Terraza', capacity: 2, status: 'free' },
]

export async function getTables() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from('tables').select('*').order('name')
    if (error || !data || data.length === 0) return mockTables
    return data
  } catch {
    return mockTables
  }
}
