'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBlacklist(shopId: string, data: { entity_type: string, identifier: string, reason?: string }) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('blacklists')
    .insert([{
      shop_id: shopId,
      entity_type: data.entity_type,
      identifier: data.identifier,
      reason: data.reason
    }])

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/blacklist')
  return { success: true }
}

export async function deleteBlacklist(id: string) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('blacklists')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/blacklist')
  return { success: true }
}
