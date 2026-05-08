<<<<<<< HEAD
import { 
  Store, Users, Ticket, ShoppingCart, 
  TrendingUp, Database, Activity, Shield 
} from 'lucide-react'
import { getPlatformStats, getShopsOverview } from '@/lib/actions/superadmin'
import { Suspense } from 'react'

function AdminStatCard({ 
  label, value, icon: Icon, color = 'violet' 
}: { 
  label: string; 
  value: string | number; 
  icon: any; 
  color?: 'violet' | 'fuchsia' | 'emerald' | 'amber' | 'blue'
}) {
  const colors = {
    violet: 'text-violet-400 border-violet-500/20',
    fuchsia: 'text-fuchsia-400 border-fuchsia-500/20',
    emerald: 'text-emerald-400 border-emerald-500/20',
    amber: 'text-amber-400 border-amber-500/20',
    blue: 'text-brand-400 border-brand-500/20',
  }

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group hover:bg-slate-900/80 transition-all duration-500 backdrop-blur-xl shadow-2xl">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] font-black text-white/40 mb-3 uppercase tracking-[0.2em]">{label}</p>
          <p className="text-4xl font-black text-white tracking-tighter">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl border bg-white/5 backdrop-blur-md ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-[0.05] group-hover:opacity-[0.08] transition-all duration-700 group-hover:scale-110`}>
        <Icon className="w-full h-full" />
      </div>
    </div>
  )
}

async function StatsGrid() {
  const stats = await getPlatformStats()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <AdminStatCard label="Total Shops" value={stats.totalShops} icon={Store} color="violet" />
      <AdminStatCard label="Total Users" value={stats.totalUsers} icon={Users} color="fuchsia" />
      <AdminStatCard label="Repair Tickets" value={stats.totalTickets} icon={Ticket} color="blue" />
      <AdminStatCard label="Total Revenue" value={`LKR ${stats.totalRevenue.toLocaleString()}`} icon={TrendingUp} color="emerald" />
      <AdminStatCard label="Customers" value={stats.totalCustomers} icon={Users} color="amber" />
      <AdminStatCard label="Transactions" value={stats.totalTransactions} icon={ShoppingCart} color="violet" />
      <AdminStatCard label="Inventory Items" value={stats.totalInventoryItems} icon={Database} color="fuchsia" />
      <AdminStatCard label="System Profit" value={`LKR ${(stats.totalRevenue - stats.totalExpenses).toLocaleString()}`} icon={Shield} color="emerald" />
    </div>
  )
}

async function RealWorldMetrics() {
  const shops = await getShopsOverview()
  const topShopsByRows = [...shops].sort((a, b) => b.totalRows - a.totalRows).slice(0, 3)
  const topShopsByRevenue = [...shops].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 3)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Database Capacity Monitor */}
      <div className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Database className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Storage Monitor</h2>
        </div>
        <div className="space-y-6">
          {topShopsByRows.map((shop, i) => {
            const capacityPercent = Math.min(Math.round((shop.totalRows / 1000) * 100), 100)
            return (
              <div key={i} className="space-y-3 p-6 bg-slate-900/40 rounded-2xl border border-white/5 group hover:bg-slate-900/60 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white tracking-tight">{shop.name}</span>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{shop.totalRows} / 1,000 Rows</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 rounded-full ${capacityPercent > 80 ? 'bg-red-500' : capacityPercent > 50 ? 'bg-amber-500' : 'bg-brand-500'}`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
              </div>
            )
          })}
          {topShopsByRows.length === 0 && (
            <p className="text-center py-10 text-white/20 text-sm font-bold uppercase tracking-widest italic">No shop data available</p>
          )}
        </div>
      </div>

      {/* Live Performance Feed */}
      <div className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Top Performers</h2>
        </div>
        <div className="space-y-6">
          {topShopsByRevenue.map((shop, i) => (
            <div key={i} className="flex items-center justify-between p-6 bg-slate-900/40 rounded-2xl border border-white/5 group hover:bg-slate-900/60 transition-all cursor-default">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 font-black text-xs border border-white/10">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-bold text-white tracking-tight">{shop.name}</p>
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">{shop.activeTickets} Active Tickets</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-emerald-400 tracking-tighter">LKR {shop.totalRevenue.toLocaleString()}</p>
                <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Revenue</p>
              </div>
            </div>
          ))}
          {topShopsByRevenue.length === 0 && (
            <p className="text-center py-10 text-white/20 text-sm font-bold uppercase tracking-widest italic">Waiting for telemetry...</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-16 animate-fade-in pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
          Terminal <span className="text-brand-500">Overview</span>
        </h1>
        <p className="text-white/40 text-lg font-medium tracking-tight">Real-time telemetry across the network nodes.</p>
      </div>

      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-40 bg-slate-900/60 border border-white/10 rounded-[2rem] animate-pulse backdrop-blur-xl" />
        ))}
      </div>}>
        <StatsGrid />
      </Suspense>

      <Suspense fallback={<div className="h-96 bg-slate-900/60 border border-white/10 rounded-[2.5rem] animate-pulse backdrop-blur-xl" />}>
        <RealWorldMetrics />
      </Suspense>
=======
import { getPlatformStats, getRecentActivity } from '@/lib/actions/superadmin'
import SuperAdminDashboardWorkspace from '@/components/features/superadmin/SuperAdminDashboardWorkspace'

export const dynamic = 'force-dynamic'

export default async function SuperAdminDashboardPage() {
  // Fetch fresh 100% database-backed stats on server startup
  const initialStats = await getPlatformStats()
  const initialActivities = await getRecentActivity()

  return (
    <div className="space-y-6">
      <SuperAdminDashboardWorkspace 
        initialStats={initialStats} 
        initialActivities={initialActivities} 
      />
>>>>>>> akila
    </div>
  )
}
