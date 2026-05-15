'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface BillingInfo {
  status: 'active' | 'past_due' | 'frozen'
  nextBillingDate: string
  amountDue: number
  daysRemaining: number
  isExpired: boolean
  isFrozen: boolean
}

/**
 * Passive guard: Checks and synchronizes the shop's billing status based on the current time.
 * This should be called on shop dashboard loads to ensure the status reflects reality.
 */
export async function syncShopBillingStatus(shopId: string): Promise<BillingInfo> {
  const admin = createAdminClient()
  
  const { data: shop, error } = await admin
    .from('shops')
    .select('subscription_status, next_billing_date, subscription_amount')
    .eq('id', shopId)
    .single()

  if (error || !shop) throw new Error('Shop not found')

  const now = new Date()
  const nextBilling = new Date(shop.next_billing_date as string)
  const freezeThreshold = new Date(nextBilling.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 days grace

  let newStatus: 'active' | 'past_due' | 'frozen' = shop.subscription_status as any

  if (now >= freezeThreshold) {
    newStatus = 'frozen'
  } else if (now >= nextBilling) {
    newStatus = 'past_due'
  } else {
    newStatus = 'active'
  }

  // Only update if status changed to avoid redundant writes
  if (newStatus !== shop.subscription_status) {
    await admin
      .from('shops')
      .update({ subscription_status: newStatus } as any)
      .eq('id', shopId)
    
    revalidatePath('/dashboard')
  }

  const diffTime = nextBilling.getTime() - now.getTime()
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return {
    status: newStatus,
    nextBillingDate: shop.next_billing_date as string,
    amountDue: shop.subscription_amount as number,
    daysRemaining,
    isExpired: now >= nextBilling,
    isFrozen: now >= freezeThreshold
  }
}

/**
 * Processes a subscription payment and extends the billing period.
 */
export async function processSubscriptionPayment(shopId: string, amount: number, transactionId: string) {
  const admin = createAdminClient()
  
  const { data: shop } = await admin
    .from('shops')
    .select('next_billing_date')
    .eq('id', shopId)
    .single()

  if (!shop) throw new Error('Shop not found')

  const currentNextBilling = new Date(shop.next_billing_date as string)
  const now = new Date()
  
  // If they are paying late, start the new month from now. 
  // If they are paying early, add 30 days to the current next billing date.
  const baseDate = currentNextBilling > now ? currentNextBilling : now
  const newNextBilling = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000)

  // 1. Log payment
  await admin.from('platform_subscriptions').insert({
    shop_id: shopId,
    amount,
    transaction_id: transactionId,
    period_start: baseDate.toISOString(),
    period_end: newNextBilling.toISOString(),
    status: 'completed'
  } as any)

  // 2. Update shop status
  const { error } = await admin
    .from('shops')
    .update({
      subscription_status: 'active',
      next_billing_date: newNextBilling.toISOString(),
      last_billing_date: now.toISOString()
    } as any)
    .eq('id', shopId)

  if (error) throw error

  revalidatePath('/dashboard')
  revalidatePath('/superadmin/billing')
  return { success: true }
}

/**
 * Admin override: Manually freeze or activate a shop.
 */
export async function adminSetSubscriptionStatus(shopId: string, status: 'active' | 'frozen') {
  const admin = createAdminClient()
  
  const { error } = await admin
    .from('shops')
    .update({ subscription_status: status } as any)
    .eq('id', shopId)

  if (error) throw error
  revalidatePath('/superadmin/shops')
  revalidatePath('/superadmin/billing')
}
