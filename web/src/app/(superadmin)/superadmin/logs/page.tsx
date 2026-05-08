import { 
  ClipboardList, Search, Filter, 
  Download, Clock, User, Store,
  Activity, ArrowUpRight, ChevronRight
} from 'lucide-react'
import { getAuditLogs } from '@/lib/actions/superadmin'

export default async function AuditLogsPage() {
  const logs = await getAuditLogs()

  return (
    <div className="space-y-6 animate-fade-in pb-20 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm flex-1 max-w-xl">
           <Search className="w-3.5 h-3.5 text-slate-400 mr-3" />
           <input 
             type="text" 
             placeholder="Search global audit stream..." 
             className="bg-transparent border-none outline-none text-xs text-slate-700 placeholder:text-slate-400 w-full font-medium" 
           />
         </div>
         <div className="flex items-center gap-3">
           <button className="px-5 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm">
             <Filter className="w-3.5 h-3.5" />
             Filter
           </button>
           <button className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg">
             <Download className="w-3.5 h-3.5 text-brand-400" />
             Export Data
           </button>
         </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Timestamp</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Operator</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Tenant</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Action</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <Clock className="w-3 h-3 text-slate-300" />
                       <span className="text-[10px] font-bold text-slate-500 uppercase">{log.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <Store className="w-3.5 h-3.5 text-brand-500/50" />
                      <span className="text-[11px] font-bold text-slate-600 truncate max-w-[120px]">{log.shop}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-white text-[9px] font-black text-slate-900 uppercase tracking-widest border border-slate-200 group-hover:border-slate-400 transition-all">
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[9px] font-mono text-slate-400 truncate max-w-xs group-hover:text-slate-900 transition-colors uppercase tracking-tight">{log.details}</p>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <ClipboardList className="w-6 h-6 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No system events recorded</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
