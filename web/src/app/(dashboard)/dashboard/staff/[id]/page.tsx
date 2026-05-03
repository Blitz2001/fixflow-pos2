import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, User, Clock, Calendar, DollarSign,
  CheckCircle2, XCircle, TrendingUp, Shield, Timer
} from 'lucide-react'
import { AttendanceLog } from '@/components/features/hr/AttendanceLog'
import { DeleteEmployeeButton } from '@/components/features/hr/DeleteEmployeeButton'

interface PageProps { params: Promise<{ id: string }> }

export default async function EmployeeDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('memberships').select('shop_id').eq('user_id', user.id).single()
  if (!membership) return null

  // Fetch employee
  const { data: emp } = await supabase
    .from('hr_employees')
    .select('*')
    .eq('id', id)
    .eq('shop_id', membership.shop_id)
    .single()
  if (!emp) notFound()

  // Fetch last 30 days of attendance
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: attendance } = await supabase
    .from('hr_attendance')
    .select('*')
    .eq('employee_id', id)
    .gte('check_in', thirtyDaysAgo.toISOString())
    .order('check_in', { ascending: false })

  // Fetch commissions
  const { data: commissions } = await supabase
    .from('hr_commissions')
    .select('*, ticket:repair_tickets(ticket_number, status)')
    .eq('employee_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Calculate stats
  const daysWorked = attendance?.filter(a => a.check_out).length ?? 0
  const totalWagesEarned = attendance?.reduce((s, a) => s + (a.daily_wage_earned ?? 0), 0) ?? 0
  const unpaidWages = attendance?.filter(a => !a.is_paid && a.check_out).reduce((s, a) => s + (a.daily_wage_earned ?? 0), 0) ?? 0
  const totalCommissions = commissions?.filter(c => c.status === 'EARNED').reduce((s, c) => s + c.amount, 0) ?? 0

  // Duration helper
  const duration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return '—'
    const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime()
    const hrs = Math.floor(ms / 3_600_000)
    const mins = Math.floor((ms % 3_600_000) / 60_000)
    return `${hrs}h ${mins}m`
  }

  const fmt = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const COMMISSION_COLORS: Record<string, string> = {
    PENDING_WARRANTY: 'bg-amber-500/10 text-amber-600',
    EARNED: 'bg-emerald-500/10 text-emerald-600',
    PAID: 'bg-blue-500/10 text-blue-600',
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Back */}
      <Link href="/dashboard/staff" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Staff
      </Link>

      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center">
              <User className="w-8 h-8 text-brand-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{emp.full_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600">{emp.role}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{emp.pay_frequency}</span>
              </div>
            </div>
          </div>
          {emp.auth_pin && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-xl border border-border">
              <Shield className="w-4 h-4" />
              <span className="font-mono font-bold">PIN: {emp.auth_pin}</span>
            </div>
          )}
          <DeleteEmployeeButton employeeId={emp.id} shopId={membership.shop_id} employeeName={emp.full_name} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Days Worked (30d)', value: daysWorked, icon: Calendar, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'Total Wages Earned', value: `LKR ${totalWagesEarned.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'Pending Payout', value: `LKR ${unpaidWages.toLocaleString()}`, icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
          { label: 'Earned Commissions', value: `LKR ${totalCommissions.toLocaleString()}`, icon: TrendingUp, color: 'text-purple-500 bg-purple-500/10' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5">
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">{label}</p>
            <p className="text-xl font-black text-foreground mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Pay Info */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-1">Daily Rate</p>
          <p className="text-lg font-bold">LKR {emp.daily_rate.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-1">Monthly Salary</p>
          <p className="text-lg font-bold">LKR {emp.base_salary.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-1">Commission Rate</p>
          <p className="text-lg font-bold">{(emp.commission_rate * 100).toFixed(0)}%</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <Timer className="w-5 h-5 text-brand-500" />
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-1">Required Hours/Day</p>
            <p className="text-lg font-bold">{(emp as any).required_hours ?? 8}h</p>
          </div>
        </div>
      </div>

      {/* Attendance Log */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          Attendance Log (Last 30 Days)
        </h2>
        <AttendanceLog
          attendance={attendance ?? []}
          employeeId={id}
          shopId={membership.shop_id}
          unpaidTotal={unpaidWages}
        />
      </div>

      {/* Commissions */}
      {(commissions?.length ?? 0) > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Commission History
          </h2>
          <div className="space-y-2">
            {commissions!.map(c => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-border">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Ticket #{(c.ticket as any)?.ticket_number ?? '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Releases {new Date(c.release_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">LKR {c.amount.toLocaleString()}</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${COMMISSION_COLORS[c.status] ?? ''}`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
