import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BlacklistList } from '@/components/features/blacklist/BlacklistList'
import { ShieldAlert } from 'lucide-react'

export default async function BlacklistPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('shop_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
    redirect('/dashboard') // Only Owners and Admins can access Blacklist
  }

  // Fetch blacklists. If the table doesn't exist yet, this will safely catch or return empty.
  const { data: blacklists, error } = await supabase
    .from('blacklists')
    .select('*')
    .eq('shop_id', membership.shop_id)
    .order('created_at', { ascending: false })

  const safeBlacklists = error ? [] : (blacklists || [])

  return (
    <div className="animate-fade-in pb-12 px-6 pt-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Security Blacklist</h1>
        </div>
        <p className="text-muted-foreground text-sm font-medium mt-1">
          Block specific customers, suppliers, or items. The system will warn staff if they attempt to interact with blacklisted entities.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
          <h3 className="text-rose-700 font-bold mb-1">Database Setup Required</h3>
          <p className="text-sm text-rose-600/80">
            The Blacklist table has not been created in your Supabase database yet. Please run the migration script `005_blacklist.sql` in your Supabase SQL Editor.
          </p>
        </div>
      )}

      <BlacklistList initialBlacklists={safeBlacklists} shopId={membership.shop_id} />
    </div>
  )
}
