import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/features/Sidebar'

/**
 * Dashboard route group layout.
 * Validates session server-side (belt-and-suspenders on top of middleware).
 * Wraps all /dashboard/* pages with the sidebar shell.
 */
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

  if (!membership) redirect('/onboarding')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        role={membership.role as 'OWNER' | 'ADMIN' | 'TECHNICIAN'}
        shopName={(membership.shop as { name: string } | null)?.name ?? 'My Shop'}
        userFullName={profile?.full_name ?? user.email ?? 'User'}
        userAvatarUrl={profile?.avatar_url ?? null}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
