import { 
  Database, HardDrive, Cpu, 
  Layers, BarChart, Server, 
  ArrowUpRight, PieChart, Info,
  Activity
} from 'lucide-react'
import { getShopsOverview } from '@/lib/actions/superadmin'
import { Suspense } from 'react'

async function DatabaseUsage() {
  const shops = await getShopsOverview()
  
  // Sort by database size (row count)
  const sortedShops = [...shops].sort((a, b) => b.totalRows - a.totalRows)
  const totalPlatformRows = shops.reduce((sum, s) => sum + s.totalRows, 0)

  return (
    <div className="space-y-12 pb-20">
      {/* Infrastructure Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Platform Rows', value: totalPlatformRows.toLocaleString(), icon: Database, color: 'text-brand-400' },
          { label: 'Capacity Used', value: `${(totalPlatformRows / 1000).toFixed(2)} MB est.`, icon: HardDrive, color: 'text-fuchsia-400' },
          { label: 'Table Indexing', value: 'OPTIMIZED', icon: Layers, color: 'text-emerald-400' },
          { label: 'System Health', value: 'HEALTHY', icon: Server, color: 'text-brand-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/60 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-white/5 text-white/20 border border-white/5">
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
            <p className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Usage Table */}
      <div className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="p-10 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20">
              <PieChart className="w-5 h-5 text-fuchsia-400" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Resource Distribution</h2>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
            <Info className="w-4 h-4 text-white/20" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Telemetry Nodes</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-10 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Shop Node</th>
                <th className="px-10 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Load Balance</th>
                <th className="px-10 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-right">Row Density</th>
                <th className="px-10 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedShops.map((shop) => {
                const percentage = totalPlatformRows > 0 ? (shop.totalRows / totalPlatformRows) * 100 : 0
                return (
                  <tr key={shop.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-10 py-8">
                      <span className="text-base font-bold text-white tracking-tight group-hover:text-brand-400 transition-colors">{shop.name}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="w-full max-w-xs bg-white/5 h-2 rounded-full overflow-hidden border border-white/5 p-[1px]">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-500 to-fuchsia-500 rounded-full shadow-[0_0_12px_rgba(30,150,255,0.3)] transition-all duration-1000" 
                          style={{ width: `${Math.max(percentage, 2)}%` }} 
                        />
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right font-black text-lg text-white/60 tracking-tighter">
                      {shop.totalRows.toLocaleString()}
                    </td>
                    <td className="px-10 py-8 text-right">
                      <span className="px-3 py-1 rounded-lg bg-fuchsia-500/10 text-fuchsia-400 text-xs font-black tracking-widest border border-fuchsia-500/20 shadow-lg shadow-fuchsia-500/5">
                        {percentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function DatabaseUsagePage() {
  return (
    <div className="space-y-16 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
          Data & <span className="text-brand-500">Export</span>
        </h1>
        <p className="text-white/40 text-lg font-medium tracking-tight">Enterprise-grade data extraction and node telemetry.</p>
      </div>

      <Suspense fallback={<div className="py-40 flex flex-col items-center gap-6">
        <Database className="w-16 h-16 text-brand-500 animate-pulse" />
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Initializing Core Engine...</p>
      </div>}>
        <DatabaseUsage />
      </Suspense>
    </div>
  )
}
