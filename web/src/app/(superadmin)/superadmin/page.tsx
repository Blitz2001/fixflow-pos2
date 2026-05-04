import { 
  Store, Users, Ticket, ShoppingCart, 
  TrendingUp, Database, Activity, Shield 
} from 'lucide-react'
import { getPlatformStats } from '@/lib/actions/superadmin'
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
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    fuchsia: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-semibold text-white/40 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        </div>
        <div className={`p-3 rounded-2xl border ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity`}>
        <Icon className="w-full h-full" />
      </div>
    </div>
  )
}

async function StatsGrid() {
  const stats = await getPlatformStats()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">Platform Overview</h1>
        <p className="text-white/40 text-sm">Real-time metrics across all shops and users.</p>
      </div>

      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-white/[0.03] border border-white/[0.06] rounded-3xl animate-pulse" />
        ))}
      </div>}>
        <StatsGrid />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-white">System Status</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/[0.04]">
              <span className="text-sm text-white/60">API Gateway</span>
              <span className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                OPERATIONAL
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/[0.04]">
              <span className="text-sm text-white/60">Database Cluster</span>
              <span className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                HEALTHY
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/[0.04]">
              <span className="text-sm text-white/60">Storage Bucket</span>
              <span className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                OPERATIONAL
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 flex flex-col justify-center items-center text-center">
          <Shield className="w-12 h-12 text-fuchsia-500 mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">Security Audit</h3>
          <p className="text-sm text-white/40 max-w-xs">
            All administrative actions are logged and traceable. Service role access is restricted to this panel.
          </p>
        </div>
      </div>
    </div>
  )
}
