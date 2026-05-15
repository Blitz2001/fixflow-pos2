import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { SuperAdminSidebar } from '@/components/features/superadmin/SuperAdminSidebar'
import { Shield, Bell, Search } from 'lucide-react'

export const metadata = {
  title: 'Super Admin | RepairOS',
  description: 'Platform-wide management console for RepairOS.',
}

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

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
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] text-slate-900 font-sans">
      {/* Unified Sidebar */}
      <SuperAdminSidebar
        userEmail={user.email!}
        userName={profile?.full_name ?? user.email!.split('@')[0]}
        userAvatarUrl={profile?.avatar_url ?? null}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative group max-w-md w-full">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-full bg-slate-100 border-none rounded-xl pl-12 pr-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg">
              <Shield className="w-4 h-4 text-slate-600" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">System Admin</span>
            </div>
            
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc]">
          <div className="p-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
