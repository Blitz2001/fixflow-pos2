import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/features/Sidebar'
import { syncShopBillingStatus } from '@/lib/actions/billing'
import { FrozenLockScreen } from '@/components/features/billing/FrozenLockScreen'
import { BillingBanner } from '@/components/features/billing/BillingBanner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch the user's active shop (first membership found)
  const { data: membership } = await supabase
    .from('memberships')
    .select('role, shop:shops(id, name, logo_url)')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const allowedEmails = (process.env.SUPER_ADMIN_EMAILS ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())
  const isSuperAdmin = allowedEmails.includes(user.email?.toLowerCase() ?? '')

  if (!membership) {
    if (isSuperAdmin) {
      redirect('/superadmin')
    }
    redirect('/onboarding')
  }

  // ── Billing Passive Guard ───────────────────────────────────────────────────
  let billing = null
  try {
    billing = await syncShopBillingStatus(membership.shop.id)
  } catch (e) {
    console.error('Billing sync failed:', e)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const shopData = membership.shop as any

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* 1. Global Lock Screen (Freeze) */}
      {billing?.status === 'frozen' && !isSuperAdmin && (
        <FrozenLockScreen 
          shopId={shopData.id} 
          shopName={shopData.name} 
          amountDue={billing.amountDue} 
        />
      )}

      <Sidebar
        role={membership.role as 'OWNER' | 'ADMIN' | 'TECHNICIAN'}
        shopName={shopData.name ?? 'My Shop'}
        userFullName={profile?.full_name ?? user.email ?? 'User'}
        userAvatarUrl={profile?.avatar_url ?? null}
      />
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* 2. Notification Banner (Past Due / Expired) */}
        {billing?.status === 'past_due' && (
          <BillingBanner 
            daysRemaining={billing.daysRemaining} 
            isExpired={billing.isExpired} 
          />
        )}

        <div className="p-2 flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}
