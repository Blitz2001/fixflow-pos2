import { getAllShopsBilling } from '@/lib/actions/superadmin-ops'
import { BillingDashboardClient } from './BillingDashboardClient'
import { 
  Zap, Search, Filter
} from 'lucide-react'
import { Suspense } from 'react'

export default async function SuperAdminBillingPage() {
  let initialData: any = { shops: [], recentSubs: [] }
  try {
    initialData = await getAllShopsBilling()
  } catch (e) {
    console.error('Failed to fetch initial billing data:', e)
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20 pt-10 px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Platform Treasury</h1>
           <p className="text-sm text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Automated Subscription Lifecycle
           </p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex-1 max-w-sm">
              <Search className="w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Search accounts..." className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 w-full" />
           </div>
           <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
              <Filter className="w-5 h-5" />
           </button>
        </div>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 animate-pulse">
           <div className="xl:col-span-2 space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-white border border-slate-200 rounded-[2.5rem]" />
              ))}
           </div>
           <div className="h-[600px] bg-white border border-slate-200 rounded-[2.5rem]" />
        </div>
      }>
        <BillingDashboardClient 
          initialShops={initialData.shops} 
          initialRecentSubs={initialData.recentSubs} 
        />
      </Suspense>
    </div>
  )
}
