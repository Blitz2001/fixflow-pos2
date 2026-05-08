'use client'

import { useState, useEffect } from 'react'
import { 
  Store, Users, TrendingUp, Activity, 
  CreditCard, LineChart, ShieldCheck, 
  LifeBuoy, ArrowUpRight, RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getPlatformStats, getRecentActivity } from '@/lib/actions/superadmin'
import { toast } from 'sonner'

interface StatsBreakdown {
  shops: {
    trial: number
    paid: number
  }
  users: {
    superAdmins: number
    owners: number
    admins: number
    staff: number
    other: number
  }
}

interface PlatformStats {
  totalShops: number
  totalUsers: number
  totalTickets: number
  totalCustomers: number
  totalRevenue: number
  revenueThisMonth: number
  totalTransactions: number
  inventoryCount: number
  newShopsThisMonth: number
  newUsersThisMonth: number
  breakdown: StatsBreakdown
}

interface ActivityLogItem {
  text: string
  time: string
  color: string
}

interface WorkspaceProps {
  initialStats: PlatformStats
  initialActivities: ActivityLogItem[]
}

export default function SuperAdminDashboardWorkspace({ initialStats, initialActivities }: WorkspaceProps) {
  const router = useRouter()
  const [stats, setStats] = useState<PlatformStats>(initialStats)
  const [activities, setActivities] = useState<ActivityLogItem[]>(initialActivities)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [navigatingPath, setNavigatingPath] = useState<string | null>(null)

  const handleNavigate = (path: string) => {
    setNavigatingPath(path)
    router.push(path)
  }

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString())
  }, [])

  // 1. Unified Real-Time Live Polling (Every 3 seconds)
  useEffect(() => {
    let active = true

    async function pollDashboardData() {
      try {
        setRefreshing(true)
        const [liveStats, liveActivities] = await Promise.all([
          getPlatformStats(),
          getRecentActivity()
        ])
        
        if (active) {
          setStats(liveStats)
          setActivities(liveActivities)
          setLastUpdated(new Date().toLocaleTimeString())
        }
      } catch (err) {
        console.error('Failed to poll live superadmin telemetry:', err)
      } finally {
        if (active) setRefreshing(false)
      }
    }

    const interval = setInterval(pollDashboardData, 3000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])



  return (
    <div className="space-y-6 animate-fade-in pb-20 pt-4">
      
      {/* Sleek, Compact Live Status Ticker Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/90 border border-slate-200/60 rounded-2xl py-3 px-6 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Real-Time Telemetry Active</p>
        </div>
        <div className="flex items-center gap-3 text-right">
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${refreshing ? 'animate-spin text-brand-500' : ''}`} />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync State:</span>
          <span className="text-xs font-black text-slate-800" suppressHydrationWarning>Live ({lastUpdated})</span>
        </div>
      </div>

      {/* Primary KPI Grid (All values computed 100% dynamically from database) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI: Shops */}
        <div 
          onClick={() => handleNavigate('/superadmin/shops')}
          className={`bg-slate-50/90 border border-slate-200/60 rounded-3xl p-6 shadow-sm backdrop-blur-md flex flex-col justify-between hover:shadow-lg transition-all group cursor-pointer relative ${
            navigatingPath === '/superadmin/shops' ? 'scale-[0.98] opacity-70 border-brand-500 ring-4 ring-brand-500/5 z-50' : ''
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/10 text-blue-600 relative overflow-hidden">
                {navigatingPath === '/superadmin/shops' ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Store className="w-5 h-5 transition-transform group-hover:scale-110" />
                )}
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[10px] font-black text-blue-600 border border-blue-100">
                +{stats.newShopsThisMonth} This Month
              </span>
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] mb-1.5">Registered Shops</p>
            <p className="text-5xl font-black text-slate-900 tracking-tighter">{stats.totalShops}</p>
          </div>
          <div className="mt-8 pt-4 border-t border-slate-200/40 space-y-2.5">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
              <span className="text-slate-400">Paid Subscribers</span>
              <span className="text-slate-800 font-bold">{stats.breakdown.shops.paid}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
              <span className="text-slate-400">Active Trials</span>
              <span className="text-slate-800 font-bold">{stats.breakdown.shops.trial}</span>
            </div>
          </div>
        </div>
 
        {/* KPI: Users */}
        <div 
          onClick={() => handleNavigate('/superadmin/users')}
          className={`bg-slate-50/90 border border-slate-200/60 rounded-3xl p-6 shadow-sm backdrop-blur-md flex flex-col justify-between hover:shadow-lg transition-all group cursor-pointer relative ${
            navigatingPath === '/superadmin/users' ? 'scale-[0.98] opacity-70 border-brand-500 ring-4 ring-brand-500/5 z-50' : ''
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/10 text-fuchsia-600 relative overflow-hidden">
                {navigatingPath === '/superadmin/users' ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Users className="w-5 h-5 transition-transform group-hover:scale-110" />
                )}
              </div>
              <span className="px-2.5 py-1 rounded-full bg-fuchsia-50 text-[10px] font-black text-fuchsia-600 border border-fuchsia-100">
                +{stats.newUsersThisMonth} Today
              </span>
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] mb-1.5">Total Profiles</p>
            <p className="text-5xl font-black text-slate-900 tracking-tighter">{stats.totalUsers}</p>
          </div>
          <div className="mt-8 pt-4 border-t border-slate-200/40 grid grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide leading-none">Owners</p>
              <p className="text-sm font-black text-slate-800">{stats.breakdown.users.owners}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide leading-none">Admins</p>
              <p className="text-sm font-black text-slate-800">{stats.breakdown.users.admins}</p>
            </div>
          </div>
        </div>
 
        {/* KPI: Revenue */}
        <div 
          onClick={() => handleNavigate('/superadmin/billing')}
          className={`bg-slate-50/90 border border-slate-200/60 rounded-3xl p-6 shadow-sm backdrop-blur-md flex flex-col justify-between hover:shadow-lg transition-all group cursor-pointer relative ${
            navigatingPath === '/superadmin/billing' ? 'scale-[0.98] opacity-70 border-brand-500 ring-4 ring-brand-500/5 z-50' : ''
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/10 text-emerald-600 relative overflow-hidden">
                {navigatingPath === '/superadmin/billing' ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <TrendingUp className="w-5 h-5 transition-transform group-hover:scale-110" />
                )}
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[10px] font-black text-emerald-600 border border-emerald-100">
                Live Ledger
              </span>
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] mb-1.5">Consolidated Gross</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">LKR {stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="mt-8 pt-4 border-t border-slate-200/40 space-y-2.5">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
              <span className="text-slate-400">Current Month Net</span>
              <span className="text-emerald-600 font-bold">LKR {stats.revenueThisMonth.toLocaleString()}</span>
            </div>
          </div>
        </div>
 
        {/* KPI: Tickets */}
        <div 
          onClick={() => handleNavigate('/superadmin/tickets')}
          className={`bg-slate-50/90 border border-slate-200/60 rounded-3xl p-6 shadow-sm backdrop-blur-md flex flex-col justify-between hover:shadow-lg transition-all group cursor-pointer relative ${
            navigatingPath === '/superadmin/tickets' ? 'scale-[0.98] opacity-70 border-brand-500 ring-4 ring-brand-500/5 z-50' : ''
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/10 text-rose-600 relative overflow-hidden">
                {navigatingPath === '/superadmin/tickets' ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Activity className="w-5 h-5 transition-transform group-hover:scale-110" />
                )}
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-50 text-[10px] font-black text-rose-600 border border-rose-100">
                Platform Workload
              </span>
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] mb-1.5">Service Tickets</p>
            <p className="text-5xl font-black text-slate-900 tracking-tighter">{stats.totalTickets.toLocaleString()}</p>
          </div>
          <div className="mt-8 pt-4 border-t border-slate-200/40 space-y-2.5">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
              <span className="text-slate-400">Unique Customer Records</span>
              <span className="text-slate-800 font-bold">{stats.totalCustomers}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Full-Width Live Shop Activity Stream Terminal */}
      <div className="bg-slate-50/90 border border-slate-200/60 rounded-3xl p-6 shadow-sm backdrop-blur-md flex flex-col h-[520px] overflow-hidden">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight leading-none mb-1">Operation Stream</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time database activity logs</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-200/50 border border-slate-200 text-[9px] font-black uppercase text-slate-500 tracking-wider">
            {activities.length} Streams Active
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {activities.map((act, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-white border border-slate-200/40 hover:border-slate-200 rounded-2xl shadow-sm transition-all group">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                act.color === 'emerald' ? 'bg-emerald-500 shadow-md shadow-emerald-500/20' :
                act.color === 'rose' ? 'bg-rose-500 shadow-md shadow-rose-500/20' :
                act.color === 'amber' ? 'bg-amber-500 shadow-md shadow-amber-500/20' : 
                'bg-blue-500 shadow-md shadow-blue-500/20'
              }`} />
              <p className="text-xs font-bold text-slate-800 flex-1 leading-snug">{act.text}</p>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{act.time}</span>
            </div>
          ))}

          {activities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Activity className="w-12 h-12 text-slate-300 animate-pulse mb-3" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No transaction activities yet</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
