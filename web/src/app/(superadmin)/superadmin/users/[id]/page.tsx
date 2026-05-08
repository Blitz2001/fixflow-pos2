import { getUserProfileDetails } from '@/lib/actions/superadmin-ops'
import { 
  ArrowLeft, Mail, Calendar, Globe, 
  ShieldCheck, Key, Clock, Store,
  UserCheck, Lock, CreditCard, Smartphone,
  CheckCircle2, XCircle, Crown, Users
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: { id: string }
}

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

export default async function UserDetailsPage({ params }: Props) {
  const data = await getUserProfileDetails(params.id)
  
  if (!data.profile) return notFound()

  const { profile, memberships, activity } = data

  const accountAgeFormatted = formatAccountAge(profile.created_at)
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="space-y-10 animate-fade-in pb-20 pt-10">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Link
            href="/superadmin/users"
            className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
              User Management / Profile
            </p>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
              {profile.full_name || 'Anonymous User'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Key className="w-3.5 h-3.5" />
            Reset Password
          </button>
          <button className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Manage Roles
          </button>
        </div>
      </div>

      {/* ── Profile Identity Card ── */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-8 text-center md:text-left">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-[2rem] bg-brand-50 border-2 border-brand-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner mx-auto md:mx-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-black text-brand-600 uppercase">
                {profile.full_name?.[0] || '?'}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                {profile.full_name || 'Anonymous User'}
              </h2>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                Active
              </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
              <span className="flex items-center gap-2 text-slate-500 font-bold">
                <Mail className="w-4 h-4 text-slate-400" />
                {profile.email}
              </span>
              <span className="flex items-center gap-2 text-slate-500 font-bold">
                <Calendar className="w-4 h-4 text-slate-400" />
                Joined {joinDate}
              </span>
              <span className="flex items-center gap-2 text-slate-500 font-bold">
                <Globe className="w-4 h-4 text-slate-400" />
                {memberships.length} Shop{memberships.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center md:justify-end gap-8 shrink-0">
            <div className="text-center min-w-[100px]">
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{accountAgeFormatted}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Account Age</p>
            </div>
            <div className="hidden sm:block w-px bg-slate-100" />
            <div className="text-center">
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{memberships.length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Memberships</p>
            </div>
            <div className="w-px bg-slate-100" />
            <div className="text-center">
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{activity.length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Recent Logs</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT: Shop Memberships */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Shop Memberships */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Shop Memberships</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Shops this user belongs to
                </p>
              </div>
              <span className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                <Store className="w-5 h-5 text-brand-500" />
              </span>
            </div>

            {memberships.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                <Users className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No shop memberships</p>
                <p className="text-xs text-slate-300 font-bold mt-1">This user is not assigned to any shop yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {memberships.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-200 hover:bg-white transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        <Store className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 tracking-tight">{m.shop?.name || 'Unknown Shop'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          ID: {m.shop?.id?.slice(0, 8) ?? '—'}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        m.role === 'OWNER'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : m.role === 'ADMIN'
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : m.role === 'TECHNICIAN'
                          ? 'bg-violet-50 text-violet-600 border-violet-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {m.role === 'OWNER' && <Crown className="w-3 h-3 inline mr-1" />}
                        {m.role}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${m.shop?.tax_enabled ? 'bg-emerald-400' : 'bg-rose-400'}`} title={m.shop?.tax_enabled ? 'Shop Active' : 'Shop Suspended'} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Activity</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Last 20 actions by this user
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Live Log
              </span>
            </div>

            {activity.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                <Clock className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No activity recorded</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activity.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <ActivityIcon action={log.action} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">{log.shop}</p>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap ml-4">
                      {log.time}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Account Info & Security */}
        <div className="space-y-8">

          {/* Account Details */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-base font-black text-slate-900 tracking-tight mb-6">Account Details</h3>
            <div className="space-y-5">
              <DetailRow label="Full Name" value={profile.full_name || '—'} />
              <DetailRow label="Email Address" value={profile.email} />
              <DetailRow label="User ID" value={profile.id.slice(0, 12) + '...'} mono />
              <DetailRow label="Joined" value={joinDate} />
              <DetailRow label="Account Age" value={accountAgeFormatted} />
              <DetailRow label="Total Shops" value={String(memberships.length)} />
            </div>
          </div>

          {/* Role Summary */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-base font-black text-slate-900 tracking-tight mb-6">Role Summary</h3>
            <div className="space-y-3">
              {memberships.length === 0 ? (
                <p className="text-sm font-bold text-slate-400 italic text-center py-4">No roles assigned</p>
              ) : (
                memberships.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <p className="text-sm font-bold text-slate-700 truncate max-w-[120px]">{m.shop?.name}</p>
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
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
          </div>

          {/* Security Panel */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-base font-black text-slate-900 tracking-tight mb-6">Security</h3>
            <div className="space-y-4">
              <SecurityItem label="Email Verified" status="verified" />
              <SecurityItem label="Two-Factor Auth" status="pending" />
              <SecurityItem label="Session Active" status="verified" />
              <SecurityItem label="Password Strength" status="strong" />
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
              <button className="w-full py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                <Key className="w-3.5 h-3.5" />
                Reset Authentication
              </button>
              <button className="w-full py-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-all flex items-center justify-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                Suspend Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ── */

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest shrink-0">{label}</p>
      <p className={`text-sm font-bold text-slate-900 text-right truncate ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  )
}

function SecurityItem({ label, status }: { label: string; status: 'verified' | 'pending' | 'strong' | 'weak' }) {
  const isGood = status === 'verified' || status === 'strong'
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm font-bold text-slate-700">{label}</p>
      <div className="flex items-center gap-2">
        {isGood ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <XCircle className="w-4 h-4 text-amber-400" />
        )}
        <span className={`text-[10px] font-black uppercase tracking-widest ${isGood ? 'text-emerald-500' : 'text-amber-500'}`}>
          {status}
        </span>
      </div>
    </div>
  )
}

function ActivityIcon({ action }: { action: string }) {
  if (action.includes('LOGIN') || action.includes('login')) return <Lock className="w-4 h-4 text-emerald-500" />
  if (action.includes('TICKET') || action.includes('ticket')) return <CreditCard className="w-4 h-4 text-blue-500" />
  if (action.includes('MEMBER') || action.includes('member')) return <UserCheck className="w-4 h-4 text-violet-500" />
  return <Smartphone className="w-4 h-4 text-slate-400" />
}
