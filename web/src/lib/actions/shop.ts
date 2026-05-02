'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import type { MembershipRole } from '@/types/database'

// ── Auth: Sign out ────────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ── Shop: Create ──────────────────────────────────────────────────────────────
const createShopSchema = z.object({
  name:    z.string().min(2),
  phone:   z.string().optional(),
  address: z.string().optional(),
})

export async function createShop(formData: FormData) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const parsed = createShopSchema.safeParse({
    name:    formData.get('name'),
    phone:   formData.get('phone'),
    address: formData.get('address'),
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { data: shop, error: shopErr } = await supabase
    .from('shops')
    .insert({ ...parsed.data, currency: 'LKR' })
    .select('id')
    .single()
  if (shopErr) throw new Error(shopErr.message)

  const { error: memErr } = await supabase
    .from('memberships')
    .insert({ user_id: user.id, shop_id: shop.id, role: 'OWNER' })
  if (memErr) throw new Error(memErr.message)

  redirect('/dashboard')
}

// ── Shop: Update settings ─────────────────────────────────────────────────────
const updateShopSchema = z.object({
  shop_id:     z.string().uuid(),
  name:        z.string().min(2),
  phone:       z.string().optional(),
  address:     z.string().optional(),
  tax_enabled: z.boolean().optional(),
  tax_rate:    z.number().optional(),
})

export async function updateShop(data: z.infer<typeof updateShopSchema>) {
  const supabase = await createServerClient()
  const { shop_id, ...fields } = data

  const { error } = await supabase
    .from('shops')
    .update(fields)
    .eq('id', shop_id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/settings')
}

// ── Membership: Invite team member ────────────────────────────────────────────
export async function inviteTeamMember(shopId: string, email: string, role: MembershipRole) {
  const supabase = await createServerClient()

  // Look up the user by email (only works if they've signed up)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', (
      await supabase.auth.admin.getUserByEmail(email)
    ).data.user?.id ?? '')
    .single()

  if (error || !profile) throw new Error('User not found. They must sign up first.')

  const { error: memErr } = await supabase
    .from('memberships')
    .insert({ user_id: profile.id, shop_id: shopId, role })
  if (memErr) throw new Error(memErr.message)

  revalidatePath('/dashboard/settings')
}

// ── Profile: Update ───────────────────────────────────────────────────────────
export async function updateProfile(fullName: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', user.id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
}
