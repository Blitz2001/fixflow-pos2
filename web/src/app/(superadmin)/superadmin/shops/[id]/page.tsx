import { getShopDetails, getShopMetrics } from '@/lib/actions/superadmin-ops'
import { 
  Store, Users, Activity, HardDrive, 
  Settings, ArrowLeft, Shield, Globe, 
  Calendar, CheckCircle2, AlertCircle, Clock, Database,
  Zap, BarChart3, Server, Cpu
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: { id: string }
}

export default async function ShopDetailsPage({ params }: Props) {
  const [data, metrics] = await Promise.all([
    getShopDetails(params.id),
    getShopMetrics(params.id)
  ])
  
  if (!data.shop) return notFound()

  const { shop, members, customers, tickets, inventory } = data

  return (
    <div className="space-y-10 animate-fade-in pb-20 pt-10 px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link 
            href="/superadmin/shops"
            className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{shop.name}</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                shop.tax_enabled ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
                {shop.tax_enabled ? 'Active' : 'Suspended'}
              </span>
            </div>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" />
              Platform Instance: {shop.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Live Sync: Active</span>
           </div>
        </div>
      </div>

      {/* Infrastructure Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard label="Data Consumption" value={metrics.database.dataSize} icon={HardDrive} color="blue" subtitle="Current DB Storage" />
        <MetricCard label="Monthly Traffic" value={`${(metrics.traffic.monthlyRequests / 1000).toFixed(1)}k`} icon={Zap} color="amber" subtitle="Platform Requests" />
        <MetricCard label="Active Sessions" value={metrics.traffic.activeSessions} icon={Users} color="fuchsia" subtitle="Real-time Connections" />
        <MetricCard label="API Latency" value={metrics.traffic.avgLatency} icon={BarChart3} color="emerald" subtitle="Optimal Response" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Resource Breakdown */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Logical Resource Mapping</h3>
            <div className="px-4 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Live Partition
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <ResourceItem label="Tickets" count={tickets.length} total={metrics.database.totalRows} />
            <ResourceItem label="Customers" count={customers.length} total={metrics.database.totalRows} />
            <ResourceItem label="Inventory" count={inventory.length} total={metrics.database.totalRows} />
            <ResourceItem label="Members" count={members.length} total={metrics.database.totalRows} />
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Instance Events</h4>
            {tickets.slice(0, 3).map(t => (
              <div key={t.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                    <span className="text-xs font-black text-slate-900">#{t.ticket_number}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Ticket Partition #{t.id.slice(0, 4)}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Status: {t.status}</p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {new Date(t.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Overrides */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-4">Instance Health</h3>
            <div className="space-y-6 mt-8">
              <HealthItem label="Database Cluster" status="Optimal" score={99.9} />
              <HealthItem label="Storage Node" status="Synchronized" score={metrics.database.uptime} />
              <HealthItem label="Auth Layer" status="Secure" score="RSA-4096" />
              <HealthItem label="API Gateway" status="Active" score={metrics.traffic.avgLatency} />
            </div>
          </div>
          
          <div className="pt-10 border-t border-slate-100 mt-10 space-y-4">
             <button className="w-full py-4 rounded-2xl bg-slate-900 text-white text-sm font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                Configure Overrides
             </button>
             <button className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <Server className="w-4 h-4" />
                Reboot Instance
             </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon: Icon, color, subtitle }: { label: string, value: any, icon: any, color: string, subtitle: string }) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    fuchsia: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  }
  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm group hover:border-brand-200 transition-all">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border transition-all group-hover:scale-110 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900 tracking-tighter mb-2">{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
    </div>
  )
}

function ResourceItem({ label, count, total }: { label: string, count: number, total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-black text-slate-900">{count}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
        <div className="h-full bg-slate-900 rounded-full transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function HealthItem({ label, status, score }: { label: string, status: string, score: any }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">{label}</span>
        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{status}</span>
      </div>
      <span className="text-xs font-black text-slate-900">{score}</span>
    </div>
  )
}
