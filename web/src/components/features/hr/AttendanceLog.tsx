'use client'

import { useTransition } from 'react'
import { markAttendancePaid, markAllUnpaidPaid } from '@/lib/actions/hr'
import { toast } from 'sonner'
import { CheckCircle2, Clock, Banknote, Loader2 } from 'lucide-react'
import type { HRAttendanceRow } from '@/types/database'

interface AttendanceLogProps {
  attendance: HRAttendanceRow[]
  employeeId: string
  shopId: string
  unpaidTotal: number
}

const fmt = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
const duration = (checkIn: string, checkOut: string | null) => {
  if (!checkOut) return null
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  const hrs = Math.floor(ms / 3_600_000)
  const mins = Math.floor((ms % 3_600_000) / 60_000)
  return `${hrs}h ${mins}m`
}

export function AttendanceLog({ attendance, employeeId, shopId, unpaidTotal }: AttendanceLogProps) {
  const [isPending, startTransition] = useTransition()

  const handlePayOne = (attendanceId: string) => {
    startTransition(async () => {
      try {
        await markAttendancePaid(attendanceId, shopId)
        toast.success('Marked as paid & expense logged!')
      } catch (err: any) {
        toast.error(err.message)
      }
    })
  }

  const handlePayAll = () => {
    startTransition(async () => {
      try {
        const result = await markAllUnpaidPaid(employeeId, shopId)
        toast.success(`Paid ${result.days} days — LKR ${result.totalAmount.toLocaleString()} logged to expenses!`)
      } catch (err: any) {
        toast.error(err.message)
      }
    })
  }

  const unpaidRows = attendance.filter(a => !a.is_paid && a.check_out)

  if (!attendance.length) {
    return <p className="text-sm text-muted-foreground text-center py-8">No attendance records yet.</p>
  }

  return (
    <div className="space-y-4">
      {/* Pay All Banner */}
      {unpaidRows.length > 0 && (
        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
              {unpaidRows.length} unpaid shift{unpaidRows.length > 1 ? 's' : ''} — LKR {unpaidTotal.toLocaleString()} owed
            </p>
            <p className="text-xs text-amber-600/70 mt-0.5">Paying will auto-log to Expenses</p>
          </div>
          <button
            onClick={handlePayAll}
            disabled={isPending}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-black tracking-wide transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Banknote className="w-3.5 h-3.5" />}
            Pay All
          </button>
        </div>
      )}

      {/* Attendance Rows */}
      {attendance.map(a => {
        const dur = duration(a.check_in, a.check_out)
        return (
          <div key={a.id} className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
            <div className="flex items-center gap-3">
              {a.check_out
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                : <Clock className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
              }
              <div>
                <p className="text-sm font-semibold text-foreground">{fmtDate(a.check_in)}</p>
                <p className="text-xs text-muted-foreground">
                  {fmt(a.check_in)} → {a.check_out ? fmt(a.check_out) : 'Still clocked in'}
                  {dur && <> · <span className="font-semibold">{dur}</span></>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">LKR {(a.daily_wage_earned ?? 0).toLocaleString()}</p>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${a.is_paid ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                  {a.is_paid ? 'PAID' : 'UNPAID'}
                </span>
              </div>
              {!a.is_paid && a.check_out && (
                <button
                  onClick={() => handlePayOne(a.id)}
                  disabled={isPending}
                  title="Mark as paid"
                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Banknote className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
