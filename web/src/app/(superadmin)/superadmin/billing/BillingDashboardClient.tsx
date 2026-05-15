'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getAllShopsBilling } from '@/lib/actions/superadmin-ops'
import { BillingControls } from './BillingControls'
import { 
  CreditCard, Zap, MoreVertical, Calendar, ArrowUpRight, Clock, ShieldAlert
} from 'lucide-react'

interface Props {
  initialShops: any[]
  initialRecentSubs: any[]
}

export function BillingDashboardClient({ initialShops, initialRecentSubs }: Props) {
  const [shops, setShops] = useState(initialShops)
  const [recentSubs, setRecentSubs] = useState(initialRecentSubs)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function refresh() {
      setRefreshing(true)
      try {
        const data = await getAllShopsBilling()
        setShops(data.shops)
        setRecentSubs(data.recentSubs)
      } catch (err) {
        console.error('Billing refresh failed:', err)
      } finally {
        setRefreshing(false)
      }
    }

    const channel = supabase
      .channel('billing-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shops' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_subscriptions' }, refresh)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const now = new Date()
  const upcomingCount = shops.filter((s: any) => {
    const next = new Date(s.next_billing_date)
    const diff = next.getTime() - now.getTime()
    return diff < 7 * 24 * 60 * 60 * 1000 // Within 7 days
  }).length

  const totalPendingAmount = shops
    .filter((s: any) => s.subscription_status === 'past_due' || s.subscription_status === 'frozen')
    .reduce((sum: number, s: any) => sum + (s.subscription_amount || 5000), 0)

  if (shops.length === 0) {
    return (
      <div className="xl:col-span-3 py-32 bg-white border border-slate-200 rounded-[3rem] text-center shadow-sm">
         <CreditCard className="w-16 h-16 text-slate-200 mx-auto mb-6" />
         <h3 className="text-xl font-black text-slate-900 mb-2">Treasury Empty</h3>
         <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No shop subscriptions found in the system.</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Treasury Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Collection Queue</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{upcomingCount} Near Expiry</p>
           </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Outstanding Arrears</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">LKR {totalPendingAmount.toLocaleString()}</p>
           </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Active Tenants</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{shops.filter((s: any) => s.subscription_status === 'active').length} Instances</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Shops Status List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2 px-2">
             <h2 className="text-xl font-black text-slate-900 tracking-tighter">Priority Billings (Nearest First)</h2>
             <div className="flex items-center gap-4">
                {refreshing && <Clock className="w-4 h-4 text-brand-500 animate-spin" />}
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{shops.length} Total Units</span>
             </div>
          </div>

          {shops.map((shop: any) => {
            const nextDate = new Date(shop.next_billing_date)
            const diffDays = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            const isNear = diffDays <= 7 && diffDays >= 0
            const isOverdue = diffDays < 0

            return (
              <div key={shop.id} className={`bg-white border rounded-[2.5rem] p-8 hover:shadow-xl transition-all shadow-sm group relative overflow-hidden ${
                isOverdue ? 'border-rose-200' : isNear ? 'border-amber-200' : 'border-slate-200'
              }`}>
                 <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 ${
                   shop.subscription_status === 'frozen' ? 'bg-rose-500' :
                   shop.subscription_status === 'past_due' ? 'bg-amber-500' :
                   'bg-emerald-500'
                 }`}></div>

                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${
                         isOverdue ? 'bg-rose-50 border border-rose-100' : 'bg-slate-50 border border-slate-100'
                       }`}>
                          <Zap className={`w-8 h-8 ${
                             shop.subscription_status === 'frozen' ? 'text-rose-400' :
                             shop.subscription_status === 'past_due' ? 'text-amber-400' :
                             'text-emerald-400'
                          }`} />
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tighter mb-1">{shop.name}</h3>
                          <div className="flex items-center gap-3">
                             <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                shop.subscription_status === 'frozen' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                shop.subscription_status === 'past_due' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                             }`}>
                                {shop.subscription_status || 'active'}
                             </span>
                             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                LKR {(shop.subscription_amount || 5000).toLocaleString()} / Mo
                             </span>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-8">
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                             <Calendar className="w-3.5 h-3.5" /> Next Billing
                          </span>
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-black text-slate-900">
                              {shop.next_billing_date ? new Date(shop.next_billing_date).toLocaleDateString() : 'Unscheduled'}
                            </p>
                            {shop.next_billing_date && (
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                                isOverdue ? 'bg-rose-100 text-rose-700' : 
                                isNear ? 'bg-amber-100 text-amber-700' : 
                                'bg-slate-100 text-slate-500'
                              }`}>
                                {isOverdue ? `${Math.abs(diffDays)} Days Late` : `${diffDays} Days Left`}
                              </span>
                            )}
                          </div>
                       </div>

                       <div className="flex items-center gap-2">
                          <BillingControls shopId={shop.id} status={shop.subscription_status || 'active'} />
                          <button className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                             <MoreVertical className="w-5 h-5" />
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            )
          })}
        </div>

        {/* Recent Ledger */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm h-fit">
          <h2 className="text-lg font-black text-slate-900 tracking-tighter mb-8 flex items-center gap-3">
             <CreditCard className="w-5 h-5 text-brand-600" /> Recent Ledger
          </h2>
          
          <div className="space-y-6">
             {recentSubs.map((sub: any) => (
               <div key={sub.id} className="group relative pl-6 border-l-2 border-slate-100 hover:border-brand-500 transition-all py-1">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[5px] w-2 h-2 rounded-full bg-slate-200 group-hover:bg-brand-500 transition-all" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                     {new Date(sub.created_at as string).toLocaleDateString()} • {sub.payment_method || 'AUTO'}
                  </p>
                  <div className="flex items-center justify-between gap-4">
                     <p className="text-sm font-black text-slate-900 truncate">Instance Payment Received</p>
                     <p className="text-sm font-black text-emerald-500 whitespace-nowrap">+ LKR {sub.amount.toLocaleString()}</p>
                  </div>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">TX: {sub.transaction_id?.slice(0, 15)}...</p>
               </div>
             ))}

             {recentSubs.length === 0 && (
               <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <Clock className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No entries found</p>
               </div>
             )}
          </div>

          <button className="w-full mt-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
             <ArrowUpRight className="w-4 h-4" />
             Export Financials
          </button>
        </div>
      </div>
    </div>
  )
}
