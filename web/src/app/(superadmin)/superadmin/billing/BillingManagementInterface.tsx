'use client'
 
import { useState } from 'react'
import { 
  CreditCard, TrendingUp, AlertCircle, 
  Search, DollarSign, Clock, ArrowUpRight, RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import RevenueChart from '@/components/features/superadmin/RevenueChart'
 
export default function BillingManagementInterface({ data }: { data: any }) {
  const [navigatingId, setNavigatingId] = useState<string | null>(null)
  const router = useRouter()
  const { stats, invoices, renewals, revenueChart } = data
 
  const handleNavigate = (id: string) => {
    setNavigatingId(id)
    router.push(`/superadmin/shops/${id}`)
  }
 
  return (
    <div className="space-y-6 animate-fade-in pb-20 pt-4">
      {/* Financial Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* MRR */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">Live MRR</span>
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Monthly Revenue</p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">LKR {stats.mrr.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12.5% Month-over-Month
          </p>
        </div>
 
        {/* Active Subscriptions */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Paid Tenants</p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{stats.activeSubscriptions}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Active SaaS Subscriptions</p>
        </div>
 
        {/* Pending Invoices */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Awaiting Settlement</p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">LKR {stats.pendingAmount.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-amber-600 mt-2 uppercase tracking-widest">{stats.pendingCount} Pending Payments</p>
        </div>
 
        {/* At Risk */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Churn Exposure</p>
          <p className="text-2xl font-black text-rose-600 tracking-tighter leading-none">LKR {stats.overdueAmount.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-rose-600 mt-2 uppercase tracking-widest">{stats.atRiskCount} Accounts Overdue</p>
        </div>
      </div>
 
      {/* SaaS Revenue Area Chart */}
      <RevenueChart data={revenueChart} />
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase">Recent Invoices</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Platform-wide transaction history</p>
            </div>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-full sm:w-auto">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input type="text" placeholder="Filter invoices..." className="bg-transparent border-none outline-none text-xs text-slate-700 placeholder:text-slate-400 w-full sm:w-40 font-medium" />
            </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="pb-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 whitespace-nowrap">ID</th>
                  <th className="pb-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 whitespace-nowrap">Tenant</th>
                  <th className="pb-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 whitespace-nowrap">Amount</th>
                  <th className="pb-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 whitespace-nowrap">Date</th>
                  <th className="pb-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700">
                {invoices.map((inv: any) => (
                  <tr 
                    key={inv.id} 
                    onClick={() => handleNavigate(inv.shopId)}
                    className={`group hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 cursor-pointer relative ${
                      navigatingId === inv.shopId ? 'scale-[0.98] opacity-70 z-50 ring-2 ring-brand-500/10' : ''
                    }`}
                  >
                    <td className="py-4 font-bold text-slate-400 group-hover:text-slate-600">
                      {navigatingId === inv.shopId ? <RefreshCw className="w-3 h-3 animate-spin text-brand-600" /> : inv.id}
                    </td>
                    <td className="py-4">
                      <p className="font-black text-slate-900 group-hover:text-brand-600 transition-colors">{inv.shop}</p>
                      <p className="text-[8px] text-brand-600 font-black uppercase tracking-[0.1em] mt-0.5">{inv.plan}</p>
                    </td>
                    <td className="py-4 font-black text-slate-900">LKR {inv.amount.toLocaleString()}</td>
                    <td className="py-4 text-slate-500 font-bold">{inv.date}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        inv.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
 
        {/* Action Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group flex flex-col h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -z-10" />
            <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase mb-6">Upcoming Renewals</h2>
            <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
              {renewals.map((sub: any, i: number) => (
                <div 
                  key={i} 
                  onClick={() => handleNavigate(sub.shopId)}
                  className={`flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-100/80 hover:border-slate-200 transition-all cursor-pointer group/item relative ${
                    navigatingId === sub.shopId ? 'scale-[0.98] opacity-70 border-brand-500 ring-2 ring-brand-500/10 z-50' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate group-hover/item:text-brand-600 transition-colors">{sub.name}</p>
                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{sub.plan}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {navigatingId === sub.shopId ? (
                      <RefreshCw className="w-3.5 h-3.5 text-brand-600 animate-spin ml-auto" />
                    ) : (
                      <>
                        <p className={`text-[10px] font-black ${sub.days <= 0 ? 'text-rose-600' : 'text-amber-600'}`}>{sub.days <= 0 ? 'Expired' : `In ${sub.days}d`}</p>
                        <ArrowUpRight className="w-3 h-3 text-slate-300 ml-auto mt-0.5 group-hover/item:text-brand-500 group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all" />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg">
              Renewal Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
