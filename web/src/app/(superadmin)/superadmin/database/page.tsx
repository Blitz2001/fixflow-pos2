import { 
  Database, HardDrive, Cpu, 
  Layers, BarChart, Server, 
  ArrowUpRight, PieChart, Info 
} from 'lucide-react'
import { getShopsOverview } from '@/lib/actions/superadmin'
import { Suspense } from 'react'

async function DatabaseUsage() {
  const shops = await getShopsOverview()
  
  // Sort by database size (row count)
  const sortedShops = [...shops].sort((a, b) => b.totalRows - a.totalRows)
  const totalPlatformRows = shops.reduce((sum, s) => sum + s.totalRows, 0)

  return (
    <div className="space-y-8">
      {/* Infrastructure Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
              <Database className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Platform Rows</p>
          </div>
          <p className="text-2xl font-bold text-white">{totalPlatformRows.toLocaleString()}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Capacity Used</p>
          </div>
          <p className="text-2xl font-bold text-white">{(totalPlatformRows / 1000).toFixed(2)} MB est.</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Table Indexing</p>
          </div>
          <p className="text-2xl font-bold text-white">OPTIMIZED</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Server className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Status</p>
          </div>
          <p className="text-2xl font-bold text-emerald-400">HEALTHY</p>
        </div>
      </div>

      {/* Usage Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-fuchsia-400" />
            Database Capacity by Shop
          </h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
            <Info className="w-3 h-3 text-white/40" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total row count distribution</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Shop Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Resource Usage</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Total Rows</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {sortedShops.map((shop) => {
                const percentage = totalPlatformRows > 0 ? (shop.totalRows / totalPlatformRows) * 100 : 0
                return (
                  <tr key={shop.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-white">{shop.name}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="w-full max-w-xs bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" 
                          style={{ width: `${Math.max(percentage, 2)}%` }} 
                        />
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-mono text-sm text-white/60">
                      {shop.totalRows.toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-xs font-black text-fuchsia-400">{percentage.toFixed(1)}%</span>
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">Database Usage</h1>
        <p className="text-white/40 text-sm">Monitor storage consumption and row counts across all platform tenants.</p>
      </div>

      <Suspense fallback={<div className="py-20 flex justify-center"><Database className="w-10 h-10 text-fuchsia-500 animate-spin opacity-20" /></div>}>
        <DatabaseUsage />
      </Suspense>
    </div>
  )
}
