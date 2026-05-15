'use client'

import { useState, useEffect } from 'react'
import { 
  Search, Filter, Plus, Store, Users, Activity, ShieldCheck, Database,
  RefreshCw
} from 'lucide-react'
import ShopActions from '@/components/features/superadmin/ShopActions'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getShopsWithPulse } from '@/lib/actions/superadmin-ops'

interface Shop {
  id: string
  name: string
  logo_url: string | null
  tax_enabled: boolean
  owner: { name: string } | null
  pulse: {
    users: number
    activeTickets: number
    criticalEvents: number
    dbSize: string
  }
}

interface Props {
  initialShops: Shop[]
}

export default function ShopNetworkInterface({ initialShops }: Props) {
  const [shops, setShops] = useState<Shop[]>(initialShops)
  const [search, setSearch] = useState('')
  const [navigatingId, setNavigatingId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  
  useEffect(() => {
    const supabase = createClient()
    
    async function refresh() {
      setRefreshing(true)
      try {
        const liveShops = await getShopsWithPulse()
        setShops(liveShops)
      } catch (err) {
        console.error('Pulse refresh failed:', err)
      } finally {
        setRefreshing(false)
      }
    }

    const channel = supabase
      .channel('shop-pulse')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shops' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memberships' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'repair_tickets' }, refresh)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleNavigate = (id: string) => {
    setNavigatingId(id)
    router.push(`/superadmin/shops/${id}`)
  }

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(search.toLowerCase()) ||
    shop.owner?.name.toLowerCase().includes(search.toLowerCase()) ||
    shop.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10 animate-fade-in pb-20 pt-4">
      {/* Search and filter command center */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex-1 max-w-xl">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search resources..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-base text-slate-900 placeholder:text-slate-400 w-full"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button 
            onClick={() => alert('Launching new shop creation wizard...')}
            className="px-8 py-4 rounded-2xl bg-slate-900 text-white text-sm font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Provision Shop
          </button>
        </div>
      </div>

      {filteredShops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
            <Store className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No shops matching search</h3>
          <p className="text-slate-400 max-w-xs mx-auto">Try refining your search terms or register a new shop tenant.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredShops.map((shop) => (
            <div 
              key={shop.id} 
              className={`group bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:border-brand-200 transition-all duration-300 shadow-sm relative overflow-hidden ${
                navigatingId === shop.id ? 'scale-[0.98] opacity-70 border-brand-500 ring-4 ring-brand-500/5 z-50' : ''
              }`}
            >
              {/* Subtle Top-Right Pulse */}
              <div className="absolute top-4 right-6 flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Instance Pulse</span>
              </div>

              <div className="flex flex-col xl:flex-row xl:items-center gap-8">
                {/* 1. Identity Section */}
                <div 
                  onClick={() => handleNavigate(shop.id)}
                  className="flex items-center gap-5 min-w-[280px] cursor-pointer group/id"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover/id:border-brand-200 transition-all relative overflow-hidden">
                    {navigatingId === shop.id ? (
                      <RefreshCw className="w-6 h-6 text-brand-600 animate-spin" />
                    ) : shop.logo_url ? (
                      <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-6 h-6 text-slate-300 group-hover/id:text-brand-500 transition-colors" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight truncate">{shop.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        shop.tax_enabled 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {shop.tax_enabled ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Users className="w-3 h-3" />
                      {shop.owner?.name || 'No Owner Assigned'}
                    </p>
                  </div>
                </div>

                {/* 2. Telemetry Section (Horizontal Bar) */}
                <div className="flex-1 flex items-center justify-between px-8 py-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none">Staff</span>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-lg font-black text-slate-900 leading-none">{shop.pulse.users}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none">Active</span>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-fuchsia-50 flex items-center justify-center text-fuchsia-500">
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-lg font-black text-slate-900 leading-none">{shop.pulse.activeTickets}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none">Audit</span>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-lg font-black text-slate-900 leading-none">{shop.pulse.criticalEvents}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none">Usage</span>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                          <Database className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-lg font-black text-slate-900 leading-none">{shop.pulse.dbSize}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Actions Section */}
                <div className="flex items-center gap-3 shrink-0">
                  <ShopActions shopId={shop.id} taxEnabled={shop.tax_enabled} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


