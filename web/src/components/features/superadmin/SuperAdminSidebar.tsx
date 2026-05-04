'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Store, Users, Activity, Database,
  Shield, LogOut, ChevronRight, Zap, Globe,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  userEmail: string
  userName: string
  userAvatarUrl: string | null
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/superadmin', icon: LayoutDashboard },
  { label: 'All Shops', href: '/superadmin/shops', icon: Store },
  { label: 'All Users', href: '/superadmin/users', icon: Users },
  { label: 'Traffic Monitor', href: '/superadmin/traffic', icon: Activity },
  { label: 'Database Usage', href: '/superadmin/database', icon: Database },
]

export function SuperAdminSidebar({ userEmail, userName, userAvatarUrl }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) =>
    href === '/superadmin' ? pathname === '/superadmin' : pathname.startsWith(href)

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className="w-72 shrink-0 flex flex-col h-full border-r border-white/[0.06] bg-[#0c0c16]/80 backdrop-blur-2xl">
      {/* Brand Header */}
      <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">RepairOS</h1>
            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.15em]">Super Admin</p>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 px-3 py-3 bg-white/[0.04] rounded-2xl border border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-xs font-black shrink-0 overflow-hidden">
            {userAvatarUrl ? (
              <img src={userAvatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-[10px] text-white/40 truncate">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-white/30 hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-red-400/10"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">
          Platform Control
        </p>
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                active
                  ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/10 text-violet-300 border border-violet-500/20 shadow-lg shadow-violet-500/5'
                  : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-violet-400' : 'text-white/30 group-hover:text-white/60'}`} />
              <span className="truncate">{item.label}</span>
              {active && <ChevronRight className="ml-auto w-3.5 h-3.5 text-violet-400/60 shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/[0.06]">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all"
        >
          <Globe className="w-4 h-4" />
          <span>Back to Shop Panel</span>
        </Link>
        <div className="mt-3 flex items-center gap-2 px-4">
          <Zap className="w-3 h-3 text-violet-500" />
          <span className="text-[10px] text-white/20 font-medium">Platform v1.0</span>
        </div>
      </div>
    </aside>
  )
}
