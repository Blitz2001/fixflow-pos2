'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Ticket, Package, BarChart3,
  Receipt, Settings, LogOut, Wrench, ChevronRight,
  Users, ShoppingCart, Landmark, Banknote, ShieldAlert, Users2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface SidebarProps {
  role: 'OWNER' | 'ADMIN' | 'TECHNICIAN'
  shopName: string
  userFullName: string
  userAvatarUrl: string | null
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles: Array<'OWNER' | 'ADMIN' | 'TECHNICIAN'>
  badge?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard',  href: '/dashboard',            icon: LayoutDashboard, roles: ['OWNER','ADMIN','TECHNICIAN'] },
    ]
  },
  {
    title: 'Repairing',
    items: [
      { label: 'Tickets',    href: '/dashboard/tickets',    icon: Ticket,          roles: ['OWNER','ADMIN','TECHNICIAN'] },
    ]
  },
  {
    title: 'Selling',
    items: [
      { label: 'Point of Sale',   href: '/dashboard/sales/new',  icon: ShoppingCart,    roles: ['OWNER','ADMIN','TECHNICIAN'] },
      { label: 'Receipts & History', href: '/dashboard/sales',      icon: Receipt,         roles: ['OWNER','ADMIN'] },
    ]
  },
  {
    title: 'Operations',
    items: [
      { label: 'Inventory',  href: '/dashboard/inventory',  icon: Package,         roles: ['OWNER','ADMIN'] },
      { label: 'Customers',  href: '/dashboard/customers',  icon: Users,           roles: ['OWNER','ADMIN','TECHNICIAN'] },
    ]
  },
  {
    title: 'Partners & Finance',
    items: [
      { label: 'Suppliers',  href: '/dashboard/suppliers',  icon: Landmark,        roles: ['OWNER','ADMIN'] },
      { label: 'Payments',   href: '/dashboard/payments',   icon: Banknote,         roles: ['OWNER','ADMIN'] },
    ]
  },
  {
    title: 'Administration',
    items: [
      { label: 'Staff',      href: '/dashboard/staff',      icon: Users2,          roles: ['OWNER', 'ADMIN'] },
      { label: 'Expenses',   href: '/dashboard/expenses',   icon: Receipt,         roles: ['OWNER','ADMIN'] },
      { label: 'Reports',    href: '/dashboard/reports',    icon: BarChart3,       roles: ['OWNER'] },
      { label: 'Settings',   href: '/dashboard/settings',   icon: Settings,        roles: ['OWNER'] },
      { label: 'Blacklist',  href: '/dashboard/blacklist',  icon: ShieldAlert,     roles: ['OWNER','ADMIN'] },
    ]
  }
]

export function Sidebar({ role, shopName, userFullName, userAvatarUrl }: SidebarProps) {
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
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  // User initials for avatar fallback
  const initials = userFullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full border-r border-border bg-card/50 backdrop-blur-xl">
      {/* Unified Identity Header (User + Shop) */}
      <div className="px-4 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3 px-3 py-3 bg-secondary/50 rounded-3xl border border-border/50 backdrop-blur-sm relative group overflow-hidden">
          {/* Avatar/Icon */}
          <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center text-white text-sm font-black shrink-0 overflow-hidden shadow-lg shadow-brand-500/20 relative z-10">
            {userAvatarUrl ? (
              <img src={userAvatarUrl} alt={userFullName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>

          {/* Identity Info */}
          <div className="min-w-0 flex-1 relative z-10">
            <p className="text-sm font-bold text-foreground truncate tracking-tight mb-1">{userFullName}</p>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black text-brand-500 uppercase tracking-widest">{role}</span>
              </div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-tight">
                {shopName}
              </p>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-muted-foreground hover:text-destructive transition-all p-2 rounded-xl hover:bg-destructive/10 relative z-10"
          >
            <LogOut className="w-4 h-4" />
          </button>
          
          {/* Decorative Wrench Background Icon */}
          <Wrench className="absolute -right-2 -bottom-2 w-12 h-12 text-brand-500/5 rotate-12 pointer-events-none" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter((item) => item.roles.includes(role))
          if (visibleItems.length === 0) return null

          return (
            <div key={section.title} className="space-y-2">
              <p className="px-4 text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
                {section.title}
              </p>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const active = isActive(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all group ${
                        active
                          ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'}`} />
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto text-[10px] bg-white text-brand-500 px-2 py-0.5 rounded-full font-black tracking-tighter">
                          {item.badge}
                        </span>
                      )}
                      {active && <ChevronRight className="ml-auto w-3.5 h-3.5 text-white/60 shrink-0" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
