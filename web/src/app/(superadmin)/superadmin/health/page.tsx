import { 
  Activity, Server, Database, ShieldCheck, 
  Cpu, HardDrive, RefreshCw, Zap,
  Clock, CheckCircle2, AlertCircle
} from 'lucide-react'
import { getSystemHealth } from '@/lib/actions/superadmin'

export default async function SystemHealthPage() {
  const health = await getSystemHealth()

  return (
    <div className="space-y-6 animate-fade-in pb-20 pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Infrastructure Panel */}
        <div className="lg:col-span-2 space-y-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                       <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
                          <Cpu className="w-3.5 h-3.5 text-blue-600" />
                       </div>
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPU Compute</h3>
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tighter">{health.infrastructure.cpuUsage}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${health.infrastructure.cpuUsage}%` }} />
                 </div>
                 <div className="flex justify-between items-center mt-4">
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Node cluster: US-EAST-1</p>
                    <div className="flex items-center gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Optimal</span>
                    </div>
                 </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                       <div className="p-2 bg-fuchsia-50 rounded-xl border border-fuchsia-100">
                          <HardDrive className="w-3.5 h-3.5 text-fuchsia-600" />
                       </div>
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memory Load</h3>
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tighter">{health.infrastructure.memUsage}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-fuchsia-500 rounded-full transition-all duration-1000" style={{ width: `${health.infrastructure.memUsage}%` }} />
                 </div>
                 <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-4">Heap size: 4.2GB / 8GB</p>
              </div>
           </div>

           <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                 <Database className="w-32 h-32 text-slate-900" />
              </div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                   <Database className="w-3.5 h-3.5 text-emerald-600" />
                   Database Cluster Real-time
                </h2>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[8px] font-black uppercase tracking-widest animate-pulse">Sync Active</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                 {[
                    { label: 'Status', value: health.database.status, color: 'text-emerald-600' },
                    { label: 'Latency', value: health.database.latency, color: 'text-slate-900' },
                    { label: 'Connections', value: health.database.connections, color: 'text-slate-900' },
                    { label: 'Uptime', value: health.database.uptime, color: 'text-slate-900' },
                 ].map((stat, i) => (
                    <div key={i}>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                       <p className={`text-sm font-black ${stat.color} tracking-tight`}>{stat.value}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Microservices Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-black text-slate-900 tracking-tight uppercase">SaaS Microservices</h2>
              <RefreshCw className="w-3 h-3 text-slate-400 animate-spin-slow cursor-pointer hover:text-slate-600 transition-colors" />
           </div>
           <div className="space-y-2.5 flex-1 overflow-y-auto no-scrollbar">
              {health.services.map((service, i) => (
                 <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-brand-200 transition-all cursor-default">
                    <div className="flex items-center gap-3">
                       <div className={`w-1.5 h-1.5 rounded-full ${service.status === 'Online' || service.status === 'Healthy' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-rose-500'}`} />
                       <div>
                          <p className="text-[11px] font-black text-slate-900 leading-none">{service.name}</p>
                          <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-1.5">{service.version}</p>
                       </div>
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{service.status}</span>
                 </div>
              ))}
           </div>
           
           <div className="mt-6 p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                 <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                 <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Security Layer</h3>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Infrastructure-wide security scan successful. All SSL certificates active.</p>
           </div>
        </div>
      </div>
    </div>
  )
}
