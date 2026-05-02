import { Suspense } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import {
  Ticket, Package, TrendingUp, AlertTriangle,
  Clock, CheckCircle2, Wrench, ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, href, color = 'blue',
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  href?: string
  color?: 'blue' | 'emerald' | 'amber' | 'red'
}) {
  const colours = {
    blue:    'bg-blue-50   text-blue-600   dark:bg-blue-900/20  dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    amber:   'bg-amber-50  text-amber-600  dark:bg-amber-900/20 dark:text-amber-400',
    red:     'bg-red-50    text-red-600    dark:bg-red-900/20   dark:text-red-400',
  }
  const Wrapper = href ? Link : 'div'
  return (
    <Wrapper
      {...(href ? { href } : {})}
      className="bg-card border border-border rounded-2xl p-5 flex items-start justify-between hover:shadow-md transition-shadow group"
    >
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className={`p-2.5 rounded-xl ${colours[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {href && <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-500 transition-colors" />}
      </div>
    </Wrapper>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
          <div className="h-3 w-20 bg-muted rounded mb-3" />
          <div className="h-8 w-16 bg-muted rounded mb-2" />
          <div className="h-2 w-24 bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}

// ── Stats fetcher ─────────────────────────────────────────────────────────────
async function DashboardStats() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('memberships')
    .select('shop_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership) return null
  const shopId = membership.shop_id

  // Parallel fetches — all filtered by shop_id via RLS
  const [tickets, lowStock, todayRevenue] = await Promise.all([
    supabase
      .from('repair_tickets')
      .select('id, status', { count: 'exact' })
      .eq('shop_id', shopId)
      .not('status', 'in', '("delivered","cancelled")'),

    supabase
      .from('inventory_items')
      .select('id', { count: 'exact' })
      .eq('shop_id', shopId)
      .filter('quantity', 'lte', 'low_stock_threshold'),

    supabase
      .from('transactions')
      .select('grand_total')
      .eq('shop_id', shopId)
      .eq('status', 'paid')
      .gte('paid_at', new Date().toISOString().split('T')[0]),
  ])

  const activeCount  = tickets.count ?? 0
  const readyCount   = tickets.data?.filter((t) => t.status === 'ready').length ?? 0
  const lowStockCount = lowStock.count ?? 0
  const todayTotal   = todayRevenue.data?.reduce((s, t) => s + (t.grand_total ?? 0), 0) ?? 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Active Tickets"  value={activeCount}  icon={Ticket}        href="/dashboard/tickets"    color="blue" />
      <StatCard label="Ready for Pickup" value={readyCount}  icon={CheckCircle2}  href="/dashboard/tickets"    color="emerald" />
      <StatCard label="Low Stock Items"  value={lowStockCount} icon={AlertTriangle} href="/dashboard/inventory" color="amber" />
      <StatCard
        label="Today's Revenue"
        value={`LKR ${todayTotal.toLocaleString()}`}
        sub="Paid transactions"
        icon={TrendingUp}
        href="/dashboard/reports"
        color="blue"
      />
    </div>
  )
}

// ── Recent tickets ────────────────────────────────────────────────────────────
async function RecentTickets() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('memberships').select('shop_id').eq('user_id', user.id).single()
  if (!membership) return null

  const { data: tickets } = await supabase
    .from('repair_tickets')
    .select(`
      id, ticket_number, status, priority, created_at,
      device:devices(model, customer:customers(name))
    `)
    .eq('shop_id', membership.shop_id)
    .not('status', 'in', '("delivered","cancelled")')
    .order('created_at', { ascending: false })
    .limit(6)

  if (!tickets?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>No active tickets yet.</p>
        <Link href="/dashboard/tickets/new" className="text-brand-500 text-sm hover:underline mt-1 inline-block">
          Create your first ticket →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tickets.map((t) => {
        const device = t.device as { model: string; customer: { name: string } } | null
        return (
          <Link key={t.id} href={`/dashboard/tickets/${t.id}`}
            className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-accent transition-colors group border border-transparent hover:border-border">
            <div className={`px-2 py-0.5 rounded-lg text-xs font-semibold status-${t.status}`}>
              {t.status.replace('_', ' ').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{t.ticket_number}</p>
              <p className="text-xs text-muted-foreground truncate">
                {device?.customer?.name} — {device?.model}
              </p>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium priority-${t.priority}`}>
              {t.priority}
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </Link>
        )
      })}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/dashboard/tickets/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Ticket className="w-4 h-4" />
          New Ticket
        </Link>
      </div>

      {/* Stats */}
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Two column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent tickets — takes 2/3 */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Active Tickets</h2>
            </div>
            <Link href="/dashboard/tickets" className="text-xs text-brand-500 hover:underline">View all →</Link>
          </div>
          <Suspense fallback={<div className="space-y-2">{Array.from({length:4}).map((_,i)=><div key={i} className="h-14 bg-muted animate-pulse rounded-xl"/>)}</div>}>
            <RecentTickets />
          </Suspense>
        </div>

        {/* Quick actions — 1/3 */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Quick Actions</h2>
          </div>
          <div className="space-y-2">
            {[
              { label: 'New Repair Ticket', href: '/dashboard/tickets/new', icon: Ticket },
              { label: 'Add Inventory Item', href: '/dashboard/inventory/new', icon: Package },
              { label: 'Record Expense', href: '/dashboard/expenses/new', icon: TrendingUp },
            ].map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-accent hover:border-brand-200 transition-all text-sm font-medium text-foreground group">
                <Icon className="w-4 h-4 text-muted-foreground group-hover:text-brand-500 transition-colors" />
                {label}
                <ArrowUpRight className="ml-auto w-3.5 h-3.5 text-muted-foreground group-hover:text-brand-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
