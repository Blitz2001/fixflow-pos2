import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { SuperAdminSidebar } from '@/components/features/superadmin/SuperAdminSidebar'

export const metadata = {
  title: 'Super Admin | RepairOS',
  description: 'Platform-wide management console for RepairOS.',
}

/**
 * Super Admin route group layout.
 * Validates the user is in the SUPER_ADMIN_EMAILS whitelist.
 */
export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const allowedEmails = (process.env.SUPER_ADMIN_EMAILS ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())

  if (!allowedEmails.includes(user.email?.toLowerCase() ?? '')) {
    redirect('/dashboard')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a12]">
      <SuperAdminSidebar
        userEmail={user.email ?? ''}
        userName={profile?.full_name ?? user.email ?? 'Admin'}
        userAvatarUrl={profile?.avatar_url ?? null}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
