'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function processTimeClock(pin: string, shopId: string) {
  const supabase = await createServerClient()

  // Enforce auth check - only authenticated sessions (the Owner/Dashboard) can submit this
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  // 1. Find employee by PIN and Shop
  const { data: employee, error: empErr } = await supabase
    .from('hr_employees')
    .select('id, full_name, daily_rate, required_hours')
    .eq('shop_id', shopId)
    .eq('auth_pin', pin)
    .single()

  if (empErr || !employee) {
    return { success: false, message: 'Invalid PIN. Please try again.' }
  }

  // 2. Check if they are currently clocked in
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data: attendance } = await supabase
    .from('hr_attendance')
    .select('id, check_in, check_out')
    .eq('employee_id', employee.id)
    .gte('check_in', today.toISOString())
    .order('check_in', { ascending: false })
    .limit(1)
    .single()

  if (attendance && !attendance.check_out) {
    // CLOCK OUT — calculate prorated wage
    const checkOutTime = new Date()
    const hoursWorked = (checkOutTime.getTime() - new Date(attendance.check_in).getTime()) / 3_600_000
    const requiredHours = (employee as any).required_hours ?? 8

    // Full pay if met required hours, otherwise prorate
    const wageEarned = hoursWorked >= requiredHours
      ? employee.daily_rate
      : parseFloat(((hoursWorked / requiredHours) * employee.daily_rate).toFixed(2))

    const { error: outErr } = await supabase
      .from('hr_attendance')
      .update({
        check_out: checkOutTime.toISOString(),
        daily_wage_earned: wageEarned
      })
      .eq('id', attendance.id)

    if (outErr) return { success: false, message: 'Database error on clock out.' }

    const hoursDisplay = hoursWorked < 1
      ? `${Math.round(hoursWorked * 60)}m`
      : `${hoursWorked.toFixed(1)}h`
    const paidFull = hoursWorked >= requiredHours

    revalidatePath('/dashboard')
    return {
      success: true,
      message: `Goodbye, ${employee.full_name}! Worked ${hoursDisplay}. Earned LKR ${wageEarned.toLocaleString()}${paidFull ? '' : ` (prorated — needed ${requiredHours}h)`}.`,
      action: 'clock_out'
    }
  } else {
    // CLOCK IN
    const { error: inErr } = await supabase
      .from('hr_attendance')
      .insert({
        shop_id: shopId,
        employee_id: employee.id,
        check_in: new Date().toISOString(),
        status: 'PRESENT'
      })

    if (inErr) return { success: false, message: 'Database error on clock in.' }

    revalidatePath('/dashboard')
    return { success: true, message: `Welcome, ${employee.full_name}! Clocked in successfully.`, action: 'clock_in' }
  }
}

export async function addEmployee(formData: FormData, shopId: string) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Double check owner status
  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', user.id)
    .eq('shop_id', shopId)
    .single()
    
  if (membership?.role !== 'OWNER' && membership?.role !== 'ADMIN') {
    throw new Error('Only owners and admins can manage staff.')
  }

  const fullName = formData.get('full_name') as string
  const role = formData.get('role') as string
  const payFrequency = formData.get('pay_frequency') as string
  const baseSalary = parseFloat(formData.get('base_salary') as string || '0')
  const dailyRate = parseFloat(formData.get('daily_rate') as string || '0')
  const commissionRate = parseFloat(formData.get('commission_rate') as string || '0')
  const authPin = formData.get('auth_pin') as string || null

  const { error } = await supabase
    .from('hr_employees')
    .insert({
      shop_id: shopId,
      full_name: fullName,
      role: role as any,
      pay_frequency: payFrequency as any,
      base_salary: baseSalary,
      daily_rate: dailyRate,
      commission_rate: commissionRate,
      auth_pin: authPin
    })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/staff')
}

// ── Mark a single attendance record as paid ───────────────────────────────────
export async function markAttendancePaid(attendanceId: string, shopId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Fetch the attendance + employee for expense logging
  const { data: att } = await supabase
    .from('hr_attendance')
    .select('*, employee:hr_employees(full_name, shop_id)')
    .eq('id', attendanceId)
    .single()

  if (!att || (att.employee as any).shop_id !== shopId) throw new Error('Not found')
  if (att.is_paid) throw new Error('Already paid')

  const amount = att.daily_wage_earned ?? 0
  const empName = (att.employee as any).full_name
  const date = new Date(att.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  // 1. Mark as paid
  await supabase.from('hr_attendance').update({ is_paid: true }).eq('id', attendanceId)

  // 2. Auto-log expense
  if (amount > 0) {
    await supabase.from('expenses').insert({
      shop_id: shopId,
      category: 'Staff Wages (Daily)',
      description: `Daily payout for ${empName} — ${date}`,
      amount,
      expense_date: new Date(att.check_in).toISOString().split('T')[0],
      created_by: user.id,
    })
  }

  revalidatePath(`/dashboard/staff`)
}

// ── Mark ALL unpaid attendance for an employee as paid ────────────────────────
export async function markAllUnpaidPaid(employeeId: string, shopId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: emp } = await supabase
    .from('hr_employees')
    .select('full_name')
    .eq('id', employeeId)
    .eq('shop_id', shopId)
    .single()
  if (!emp) throw new Error('Employee not found')

  const { data: unpaid } = await supabase
    .from('hr_attendance')
    .select('id, daily_wage_earned, check_in')
    .eq('employee_id', employeeId)
    .eq('is_paid', false)
    .not('check_out', 'is', null)

  if (!unpaid?.length) throw new Error('No unpaid records found')

  const totalAmount = unpaid.reduce((s, a) => s + (a.daily_wage_earned ?? 0), 0)

  // Mark all as paid
  await supabase.from('hr_attendance')
    .update({ is_paid: true })
    .eq('employee_id', employeeId)
    .eq('is_paid', false)

  // Single bulk expense entry
  if (totalAmount > 0) {
    await supabase.from('expenses').insert({
      shop_id: shopId,
      category: 'Staff Wages (Daily)',
      description: `Bulk payout for ${emp.full_name} (${unpaid.length} days)`,
      amount: totalAmount,
      expense_date: new Date().toISOString().split('T')[0],
      created_by: user.id,
    })
  }

  revalidatePath(`/dashboard/staff`)
  return { totalAmount, days: unpaid.length }
}

// ── Delete an employee ────────────────────────────────────────────────────────
export async function deleteEmployee(employeeId: string, shopId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', user.id)
    .eq('shop_id', shopId)
    .single()

  if (membership?.role !== 'OWNER' && membership?.role !== 'ADMIN') {
    throw new Error('Only owners and admins can delete staff.')
  }

  const { error } = await supabase
    .from('hr_employees')
    .delete()
    .eq('id', employeeId)
    .eq('shop_id', shopId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/staff')
}
