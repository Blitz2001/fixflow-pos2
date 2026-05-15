'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, Store, Users, CreditCard, LifeBuoy, 
  Settings, LineChart, Shield, LogOut, Globe 
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  userEmail: string
  userName: string
  userAvatarUrl: string | null
}

const NAV_GROUPS = [
  {
    title: 'Command Center',
    items: [
      { label: 'Dashboard', href: '/superadmin', icon: LayoutDashboard },
      { label: 'Shop Network', href: '/superadmin/shops', icon: Store },
      { label: 'User Database', href: '/superadmin/users', icon: Users },
      { label: 'Platform Billing', href: '/superadmin/billing', icon: CreditCard },
      { label: 'Support Tickets', href: '/superadmin/tickets', icon: LifeBuoy },
    ]
  },
  {
    title: 'Advanced Controls',
    items: [
      { label: 'Platform Control', href: '/superadmin/settings', icon: Settings },
      { label: 'System Analytics', href: '/superadmin/analytics', icon: LineChart },
    ]
  }
]

export function SuperAdminSidebar({ userEmail, userName, userAvatarUrl }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/auth/login')
    router.refresh()
  }

  const isActive = (href: string) =>
    href === '/superadmin'
      ? pathname === '/superadmin'
      : pathname === href || pathname.startsWith(href + '/')

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className="w-72 shrink-0 flex flex-col h-full bg-[#f8fafc] border-r border-slate-200 z-30">
      <div className="relative flex flex-col h-full">
        {/* Brand Header */}
        <div className="px-6 py-8 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200 shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight truncate">Repair<span className="text-brand-600">OS</span></h1>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">Super Admin</p>
            </div>
          </div>

          {/* User Card - White Card on Slate BG */}
          <div className="flex items-center gap-3 px-4 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm group/user">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0 overflow-hidden border border-slate-200">
              {userAvatarUrl ? (
                <img src={userAvatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate tracking-tight leading-none mb-1">{userName}</p>
              <p className="text-[10px] text-slate-400 truncate font-bold uppercase tracking-wider">{userEmail.split('@')[0]}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-slate-300 hover:text-rose-600 transition-all p-1.5 rounded-lg hover:bg-rose-50 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto custom-scrollbar">
          {NAV_GROUPS.map((group, idx) => (
            <div key={idx} className="space-y-1.5">
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map(item => {
                  const active = isActive(item.href)
                  const Icon = item.icon
                  return (
                    <button
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className={`flex w-full text-left items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-200 group/nav ${
                        active
                          ? 'bg-slate-900 text-white shadow-md shadow-slate-200 scale-[1.02]'
                          : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm border border-transparent hover:border-slate-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover/nav:text-slate-600'}`} />
                      <span className="truncate tracking-tight">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-6 border-t border-slate-200 bg-white">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all text-left uppercase tracking-widest border border-transparent hover:border-slate-100"
          >
            <Globe className="w-4 h-4" />
            <span className="truncate">Exit Admin Portal</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
