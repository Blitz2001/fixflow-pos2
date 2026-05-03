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
    .select('id, full_name, daily_rate')
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
    // CLOCK OUT
    const { error: outErr } = await supabase
      .from('hr_attendance')
      .update({ 
        check_out: new Date().toISOString(),
        // Assign the base daily rate (later we can calculate partial days or add commissions here)
        daily_wage_earned: employee.daily_rate 
      })
      .eq('id', attendance.id)

    if (outErr) return { success: false, message: 'Database error on clock out.' }
    
    revalidatePath('/dashboard')
    return { success: true, message: `Goodbye, ${employee.full_name}! Clocked out successfully.`, action: 'clock_out' }
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
