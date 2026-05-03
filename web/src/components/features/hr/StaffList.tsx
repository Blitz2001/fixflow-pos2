'use client'

import { useState, useTransition } from 'react'
import { addEmployee } from '@/lib/actions/hr'
import { toast } from 'sonner'
import type { HREmployeeRow, HRAttendanceRow } from '@/types/database'
import {
  UserPlus, X, User, Clock, Loader2,
  Briefcase, DollarSign, Shield
} from 'lucide-react'
import { TimeClockAction } from './TimeClockAction'
import Link from 'next/link'

type EmployeeWithAttendance = HREmployeeRow & {
  today_attendance?: HRAttendanceRow | null
}

interface StaffListProps {
  employees: EmployeeWithAttendance[]
  shopId: string
}

const ROLE_COLORS: Record<string, string> = {
  Technician: 'bg-blue-500/10 text-blue-600',
  Manager:    'bg-purple-500/10 text-purple-600',
  Cashier:    'bg-emerald-500/10 text-emerald-600',
}

export function StaffList({ employees, shopId }: StaffListProps) {
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await addEmployee(formData, shopId)
        toast.success('Employee added successfully!')
        setShowForm(false)
        ;(e.target as HTMLFormElement).reset()
      } catch (err: any) {
        toast.error(err.message)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{employees.length} team member{employees.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <TimeClockAction shopId={shopId} />
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Employee Grid */}
      {employees.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl">
          <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-semibold text-muted-foreground">No staff added yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Add your first employee to get started</p>
          <button onClick={() => setShowForm(true)} className="mt-4 text-brand-500 text-sm font-semibold hover:underline">
            Add Employee →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => {
            const isClockedIn = emp.today_attendance && !emp.today_attendance.check_out
            return (
              <Link key={emp.id} href={`/dashboard/staff/${emp.id}`}
                className="bg-card border border-border rounded-2xl p-5 space-y-4 hover:shadow-md hover:border-brand-200 transition-all cursor-pointer block">

                {/* Name & Status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-500/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-brand-500" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{emp.full_name}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[emp.role] || 'bg-muted text-muted-foreground'}`}>
                        {emp.role}
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                    isClockedIn ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'}`} />
                    {isClockedIn ? 'Clocked In' : 'Off Shift'}
                  </div>
                </div>

                {/* Pay Info */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Pay Type</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{emp.pay_frequency}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
                      {emp.pay_frequency === 'DAILY' ? 'Daily Rate' : 'Monthly'}
                    </p>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      LKR {(emp.pay_frequency === 'DAILY' ? emp.daily_rate : emp.base_salary).toLocaleString()}
                    </p>
                  </div>
                  {emp.commission_rate > 0 && (
                    <div className="col-span-2">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Commission</p>
                      <p className="text-sm font-bold text-emerald-600 mt-0.5">{(emp.commission_rate * 100).toFixed(0)}% of labor</p>
                    </div>
                  )}
                  {emp.auth_pin ? (
                    <div className="col-span-2 flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Clock-In PIN:</p>
                      <p className="text-sm font-mono font-bold text-foreground">{emp.auth_pin}</p>
                    </div>
                  ) : (
                    <div className="col-span-2">
                      <p className="text-xs text-amber-600 font-semibold">⚠ No PIN set — cannot use Time Clock</p>
                    </div>
                  )}
                </div>

                {/* Clock info */}
                {isClockedIn && emp.today_attendance && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl px-3 py-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Clocked in at {new Date(emp.today_attendance.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}

      {/* Add Employee Modal */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={() => setShowForm(false)} />
          <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-background border border-border rounded-3xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">Add New Employee</h2>
                <p className="text-sm text-muted-foreground">They can clock in using their PIN</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input name="full_name" required placeholder="e.g. Kamal Perera" className="w-full pl-9 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>

              {/* Role & Pay Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Role *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select name="role" required defaultValue="Technician" className="w-full pl-9 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none">
                      <option value="Technician">Technician</option>
                      <option value="Manager">Manager</option>
                      <option value="Cashier">Cashier</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Pay Type *</label>
                  <select name="pay_frequency" required defaultValue="DAILY" className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="DAILY">Daily</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>

              {/* Pay Rates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Daily Rate (LKR)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input name="daily_rate" type="number" step="0.01" defaultValue="0" placeholder="0.00" className="w-full pl-9 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Monthly Salary (LKR)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input name="base_salary" type="number" step="0.01" defaultValue="0" placeholder="0.00" className="w-full pl-9 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                </div>
              </div>

              {/* Commission & Required Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Commission Rate (%)</label>
                  <input name="commission_rate" type="number" step="0.01" min="0" max="1" defaultValue="0" placeholder="e.g. 0.10 for 10%" className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Required Hours/Day</label>
                  <input name="required_hours" type="number" step="0.5" min="1" max="24" defaultValue="8" className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>

              {/* PIN */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Clock-In PIN</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input name="auth_pin" type="password" maxLength={4} minLength={4} pattern="\d{4}" placeholder="4-digit PIN" className="w-full pl-9 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {isPending ? 'Saving...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
