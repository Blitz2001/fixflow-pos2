import { 
  ShieldCheck, ShieldAlert, Lock, Fingerprint, 
  Globe, Eye, ClipboardList, AlertCircle,
  CheckCircle2, Info, ArrowUpRight
} from 'lucide-react'
import { getSecurityStats } from '@/lib/actions/superadmin'
import SuperAdminActionButton from '@/components/features/superadmin/SuperAdminActionButton'

export default async function SecurityCenterPage() {
  const stats = await getSecurityStats()

  return (
    <div className="space-y-6 animate-fade-in pb-20 pt-4">
      {/* Security Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">MFA Adoption</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{stats.mfaAdoption}</p>
              <div className="flex items-center gap-1.5 mt-3 text-slate-400 text-[9px] font-black uppercase tracking-tight">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Target: 100% Mandatory</span>
              </div>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <Fingerprint className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Platform Shields</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{stats.activeFirewalls}</p>
              <div className="flex items-center gap-1.5 mt-3 text-slate-400 text-[9px] font-black uppercase tracking-tight">
                <Globe className="w-3 h-3 text-blue-500" />
                <span>Global Traffic filtering</span>
              </div>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Threats Neutralized</p>
              <p className="text-2xl font-black text-rose-600 tracking-tighter">{stats.blockedIPs}</p>
              <div className="flex items-center gap-1.5 mt-3 text-rose-400 text-[9px] font-black uppercase tracking-tight">
                <ShieldAlert className="w-3 h-3" />
                <span>Active IP Blocks</span>
              </div>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Audit Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-black text-slate-900 tracking-tight uppercase">Security Audit Stream</h2>
            <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all flex items-center gap-1.5">
              Extended View <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-2.5 flex-1 overflow-y-auto no-scrollbar">
            {stats.recentEvents.map((event, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-brand-200 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                    event.status === 'Blocked' ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'
                  }`}>
                    <Eye className={`w-4 h-4 ${event.status === 'Blocked' ? 'text-rose-600' : 'text-emerald-600'}`} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 leading-none">{event.event}</p>
                    <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-1.5">{event.shop} • {event.time}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                  event.status === 'Blocked' ? 'bg-rose-100/50 text-rose-600 border-rose-200' : 'bg-emerald-100/50 text-emerald-600 border-emerald-200'
                }`}>
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Policies */}
        <div className="space-y-6">
           <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">Active Security Policies</h3>
              <div className="space-y-4">
                 {[
                   { label: 'IP Whitelisting', status: 'Enforced', color: 'emerald' },
                   { label: 'Brute Force Shield', status: 'Enforced', color: 'emerald' },
                   { label: 'SSL Enforcement', status: 'Enforced', color: 'emerald' },
                   { label: 'MFA Requirements', status: 'Mandatory', color: 'amber' },
                 ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{item.label}</span>
                       <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                         item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                       }`}>{item.status}</span>
                    </div>
                 ))}
              </div>
           </div>

           <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                 <Info className="w-4 h-4 text-brand-400" />
                 <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Platform Integrity</h3>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">System-wide encryption is active via AES-256-GCM. All database nodes are strictly isolated within the VPC.</p>
           </div>
        </div>
      </div>
    </div>v>
  )
}
