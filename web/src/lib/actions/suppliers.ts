'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SupplierRow } from '@/types/database'

export async function createSupplier(shopId: string, data: { name: string, contact_person?: string, phone?: string, email?: string }) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('suppliers')
    .insert([{
      shop_id: shopId,
      name: data.name,
      contact_person: data.contact_person,
      phone: data.phone,
      email: data.email
    }])

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/suppliers')
  return { success: true }
}

export async function updateSupplier(id: string, data: Partial<Omit<SupplierRow, 'id' | 'shop_id' | 'created_at'>>) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('suppliers')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/suppliers')
  return { success: true }
}
