import { Suspense } from 'react'
import { FileSpreadsheet, Download, ShieldCheck, History } from 'lucide-react'
import { getShopsOverview } from '@/lib/actions/superadmin'
import { DatabaseExportCenter } from '@/components/features/superadmin/DatabaseExportCenter'

async function ExportContent() {
  const shops = await getShopsOverview()
  const sortedShops = [...shops].sort((a, b) => b.totalRows - a.totalRows)

  return (
    <div className="space-y-12 pb-20">
      {/* Security Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-8 flex items-center gap-6 backdrop-blur-xl">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white tracking-tight uppercase italic">Secure Data Extraction</h3>
          <p className="text-white/40 text-sm font-medium">All exports are encrypted and logged for security auditing. Service role access is required for full node extraction.</p>
        </div>
      </div>

      <DatabaseExportCenter shops={sortedShops} />

      {/* Export History Placeholder */}
      <div className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
            <History className="w-5 h-5 text-white/40" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Recent Archives</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
          <Download className="w-12 h-12 mb-4" />
          <p className="text-sm font-black uppercase tracking-[0.3em]">No recent extraction logs</p>
        </div>
      </div>
    </div>
  )
}

export default function ExportsPage() {
  return (
    <div className="space-y-16 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
          Data <span className="text-brand-500">Archives</span>
        </h1>
        <p className="text-white/40 text-lg font-medium tracking-tight">Full platform database extraction and shop-specific archives.</p>
      </div>

      <Suspense fallback={<div className="py-40 flex flex-col items-center gap-6">
        <FileSpreadsheet className="w-16 h-16 text-brand-500 animate-pulse" />
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Preparing Extraction Engine...</p>
      </div>}>
        <ExportContent />
      </Suspense>
    </div>
  )
}
