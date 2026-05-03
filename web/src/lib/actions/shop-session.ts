'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function openShop(shopId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check if already open (no closed_at today)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const { data: existing } = await supabase
    .from('shop_sessions')
    .select('id')
    .eq('shop_id', shopId)
    .gte('opened_at', today.toISOString())
    .is('closed_at', null)
    .single()

  if (existing) throw new Error('Shop is already open.')

  const { error } = await supabase
    .from('shop_sessions')
    .insert({ shop_id: shopId, opened_by: user.id, opened_at: new Date().toISOString() })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function closeShop(shopId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const { data: session, error: findErr } = await supabase
    .from('shop_sessions')
    .select('id')
    .eq('shop_id', shopId)
    .gte('opened_at', today.toISOString())
    .is('closed_at', null)
    .single()

  if (findErr || !session) throw new Error('No open session found.')

  const { error } = await supabase
    .from('shop_sessions')
    .update({ closed_at: new Date().toISOString(), closed_by: user.id })
    .eq('id', session.id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}
