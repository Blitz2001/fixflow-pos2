'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PartnerRow } from '@/types/database'

export async function createSupplier(shopId: string, data: { name: string, contact_person?: string, phone?: string, email?: string }) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('partners')
    .insert([{
      shop_id: shopId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      partner_types: ['is_supplier']
    }])

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/suppliers')
  return { success: true }
}

export async function updateSupplier(id: string, data: Partial<Omit<PartnerRow, 'id' | 'shop_id' | 'created_at' | 'partner_types'>>) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('partners')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/suppliers')
  return { success: true }
}
