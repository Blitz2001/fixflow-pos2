import { 
  Activity, ArrowUpRight, ArrowDownRight, 
  Clock, CheckCircle2, AlertCircle, 
  Zap, BarChart3, Store 
} from 'lucide-react'
import { getShopsOverview } from '@/lib/actions/superadmin'
import { Suspense } from 'react'

async function TrafficMonitor() {
  const shops = await getShopsOverview()
  
  // Sort by activity (tickets + transactions)
  const sortedShops = [...shops].sort((a, b) => (b.totalTickets + b.activeTickets) - (a.totalTickets + a.activeTickets))

  return (
    <div className="space-y-8">
      {/* Top Active Shops */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sortedShops.slice(0, 3).map((shop, i) => (
          <div key={shop.id} className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-3xl p-6 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                  <span className="text-lg font-black text-white/50">#{i + 1}</span>
                </div>
                <Zap className="w-5 h-5 text-fuchsia-400 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 truncate">{shop.name}</h3>
              <p className="text-xs text-white/40 mb-4 font-medium uppercase tracking-widest">Active Traffic</p>
              <div className="flex items-end gap-3">
                <p className="text-4xl font-black text-white">{shop.activeTickets}</p>
                <p className="text-sm text-fuchsia-400 font-bold mb-1 flex items-center gap-0.5">
                  <ArrowUpRight className="w-4 h-4" /> High Load
                </p>
              </div>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-[0.05] group-hover:scale-110 transition-transform">
              <Activity className="w-24 h-24 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Traffic Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            Platform-wide Traffic
          </h2>
          <span className="text-xs font-bold text-white/20 uppercase tracking-widest">Sorted by Active Tickets</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Shop</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-center">Active Repairs</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-center">Total Repairs</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-center">Customers</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {sortedShops.map((shop) => (
                <tr key={shop.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400 group-hover:bg-violet-500/20 transition-all">
                        {shop.name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-white">{shop.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-bold text-white">{shop.activeTickets}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm text-white/60">{shop.totalTickets}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm text-white/60">{shop.customerCount}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        shop.activeTickets > 5 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {shop.activeTickets > 5 ? 'Busy' : 'Idle'}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function TrafficMonitorPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">Traffic Monitor</h1>
        <p className="text-white/40 text-sm">Analyze active repairs and customer flow across the entire platform.</p>
      </div>

      <Suspense fallback={<div className="py-20 flex justify-center"><Activity className="w-10 h-10 text-violet-500 animate-spin opacity-20" /></div>}>
        <TrafficMonitor />
      </Suspense>
    </div>
  )
}
