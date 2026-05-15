'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, UserPlus, Mail, Search, Filter, MoreVertical,
  Crown, Clock, UserX, RefreshCw
} from 'lucide-react'

function formatAccountAge(createdAt: string) {
  const diff = Date.now() - new Date(createdAt).getTime()
  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (totalDays <= 0) return '0/30'
  
  const months = Math.floor(totalDays / 30)
  const days = totalDays % 30
  
  if (months === 0) {
    return `${days}/30`
  }
  
  return `${months} ${months === 1 ? 'Month' : 'Months'}, ${days}/30`
}

function UserSummaryMetric({ label, count, icon: Icon, color }: { label: string; count: number; icon: any; color: string }) {
  const colors: any = {
    blue: 'text-blue-500 bg-blue-50 border-blue-100',
    amber: 'text-amber-500 bg-amber-50 border-amber-100',
    rose: 'text-rose-500 bg-rose-100 border-rose-200',
    emerald: 'text-emerald-500 bg-emerald-50 border-emerald-100',
  }
  return (
    <div className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-3xl shadow-sm flex-1 group/metric hover:shadow-md transition-all duration-300">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-transform duration-500 group-hover/metric:scale-110 ${colors[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{count}</p>
      </div>
    </div>
  )
}

export default function UserManagementInterface({ users }: { users: any[] }) {
  const [navigatingId, setNavigatingId] = useState<string | null>(null)
  const router = useRouter()

  const handleNavigate = (id: string) => {
    setNavigatingId(id)
    router.push(`/superadmin/users/${id}`)
  }

  if (!users.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
          <Users className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No users found</h3>
        <p className="text-slate-400 max-w-xs mx-auto">The user database is currently empty.</p>
      </div>
    )
  }

  // ── Compute real-time stats ──
  const totalUsers = users.length
  const totalOwners = (users || []).filter(u => (u.memberships || []).some((m: any) => m.role === 'OWNER')).length
  const totalUnassigned = (users || []).filter(u => (u.memberships || []).length === 0).length
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  const totalRecent = (users || []).filter(u => new Date(u.created_at).getTime() >= thirtyDaysAgo).length

  return (
    <div className="space-y-6">
      {/* ── Compact Dashboard Stats Banner ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <UserSummaryMetric label="Total Accounts" count={totalUsers} icon={Users} color="blue" />
        <UserSummaryMetric label="Shop Owners" count={totalOwners} icon={Crown} color="amber" />
        <UserSummaryMetric label="Unassigned" count={totalUnassigned} icon={UserX} color="rose" />
        <UserSummaryMetric label="New (30 Days)" count={totalRecent} icon={Clock} color="emerald" />
      </div>

      {/* ── Compact List Layout ── */}
      <div className="space-y-4">
        {users.map((user) => (
          <div 
            key={user.id} 
            onClick={() => handleNavigate(user.id)}
            className={`group bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-xl hover:border-brand-200 transition-all duration-300 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 cursor-pointer ${
              navigatingId === user.id ? 'scale-[0.98] opacity-70 border-brand-500 ring-4 ring-brand-500/5 z-50' : ''
            }`}
          >
            {/* Identity */}
            <div className="flex items-center gap-5 min-w-[280px]">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner transition-all relative">
                {navigatingId === user.id ? (
                  <RefreshCw className="w-5 h-5 text-brand-600 animate-spin" />
                ) : user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-600 text-base font-black">
                    {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-slate-900 tracking-tight truncate group-hover:text-brand-600 transition-colors">
                  {user.full_name || 'Anonymous User'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold truncate flex items-center gap-1.5 uppercase tracking-widest mt-0.5">
                  <Mail className="w-3 h-3" /> {user.email}
                </p>
              </div>
            </div>

            {/* Assignments Bar */}
            <div className="flex-1 flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
              {(!user.memberships || user.memberships.length === 0) ? (
                <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-100">
                  Unassigned
                </span>
              ) : (
                user.memberships.map((m: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50/80 border border-slate-100 px-3 py-1.5 rounded-xl shrink-0">
                    <span className="text-[11px] font-black text-slate-700">{m.shop?.name}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                      m.role === 'OWNER' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      m.role === 'ADMIN' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {m.role}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-10 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tenure</p>
                <p className="text-xs font-black text-slate-900">{formatAccountAge(user.created_at)}</p>
              </div>
              <div className="text-right hidden xl:block">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Joined</p>
                <p className="text-xs font-black text-slate-500">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <div className="p-2 text-slate-300 group-hover:text-brand-500 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
