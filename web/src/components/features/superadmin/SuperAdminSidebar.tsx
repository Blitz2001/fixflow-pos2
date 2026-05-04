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
    <aside className="w-80 shrink-0 flex flex-col h-full border-r border-white/10 bg-[#1e293b]/40 backdrop-blur-2xl">
      {/* Brand Header */}
      <div className="px-8 pt-10 pb-8 border-b border-white/5">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#2d4356]/10 backdrop-blur-md border border-[#2d4356]/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">FixFlow <span className="opacity-50">POS</span></h1>
            <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">Platform Control</p>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-4 px-4 py-4 bg-white/5 rounded-[1.5rem] border border-white/10 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-black shrink-0 overflow-hidden shadow-lg shadow-brand-500/20">
            {userAvatarUrl ? (
              <img src={userAvatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate tracking-tight">{userName}</p>
            <p className="text-[10px] text-white/40 truncate font-medium">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-white/20 hover:text-white transition-all p-1.5 rounded-lg hover:bg-white/5"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        <p className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">
          Terminal Access
        </p>
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group ${
                active
                  ? 'bg-white/10 text-white border border-white/10 shadow-2xl backdrop-blur-md'
                  : 'text-white/40 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-colors ${active ? 'text-brand-400' : 'text-white/20 group-hover:text-white/40'}`} />
              <span className="truncate tracking-tight">{item.label}</span>
              {active && <ChevronRight className="ml-auto w-4 h-4 text-brand-400/60 shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-6 border-t border-white/5">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
        >
          <Globe className="w-4 h-4" />
          <span className="tracking-tight">Exit Command Center</span>
        </Link>
        <div className="mt-4 flex items-center gap-2 px-4 opacity-20">
          <Zap className="w-3 h-3 text-brand-400" />
          <span className="text-[10px] text-white font-black uppercase tracking-widest">FixFlow v1.0</span>
        </div>
      </div>
    </aside>
  )
}
