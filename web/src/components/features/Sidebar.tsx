'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Ticket, Package, BarChart3,
  Receipt, Settings, LogOut, Wrench, ChevronRight,
  Users, ShoppingCart,
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

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  href: '/dashboard',            icon: LayoutDashboard, roles: ['OWNER','ADMIN','TECHNICIAN'] },
  { label: 'Direct POS', href: '/dashboard/sales/new',  icon: ShoppingCart,    roles: ['OWNER','ADMIN','TECHNICIAN'] },
  { label: 'Tickets',    href: '/dashboard/tickets',    icon: Ticket,          roles: ['OWNER','ADMIN','TECHNICIAN'] },
  { label: 'Inventory',  href: '/dashboard/inventory',  icon: Package,         roles: ['OWNER','ADMIN'] },
  { label: 'Customers',  href: '/dashboard/customers',  icon: Users,           roles: ['OWNER','ADMIN','TECHNICIAN'] },
  { label: 'Sales',      href: '/dashboard/sales',      icon: ShoppingCart,    roles: ['OWNER','ADMIN'] },
  { label: 'Expenses',   href: '/dashboard/expenses',   icon: Receipt,         roles: ['OWNER','ADMIN'] },
  { label: 'Reports',    href: '/dashboard/reports',    icon: BarChart3,       roles: ['OWNER'] },
  { label: 'Settings',   href: '/dashboard/settings',   icon: Settings,        roles: ['OWNER'] },
]

export function Sidebar({ role, shopName, userFullName, userAvatarUrl }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role))

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
    <aside className="w-64 shrink-0 flex flex-col h-full border-r border-border bg-card">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500 shrink-0">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{shopName}</p>
          <p className="text-xs text-muted-foreground">RepairOS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? 'text-brand-500' : 'text-muted-foreground group-hover:text-foreground'}`} />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className="ml-auto text-xs bg-brand-500 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>
              )}
              {active && <ChevronRight className="ml-auto w-3.5 h-3.5 text-brand-500 shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* Role badge */}
      <div className="px-5 pb-2">
        <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${
          role === 'OWNER' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
          role === 'ADMIN' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
        }`}>{role}</span>
      </div>

      {/* User profile */}
      <div className="px-3 pb-4 border-t border-border pt-3">
        <div className="flex items-center gap-3 px-2 py-2">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
            {userAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userAvatarUrl} alt={userFullName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{userFullName}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-lg hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
