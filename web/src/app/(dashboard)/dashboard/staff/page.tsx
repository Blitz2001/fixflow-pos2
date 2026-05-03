import { createServerClient } from '@/lib/supabase/server'
import { StaffList } from '@/components/features/hr/StaffList'

export default async function StaffPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('memberships')
    .select('shop_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) return null
  const shopId = membership.shop_id

  // Fetch all employees
  const { data: employees } = await supabase
    .from('hr_employees')
    .select('*')
    .eq('shop_id', shopId)
    .order('full_name')

  // Fetch today's attendance for each employee
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: todayAttendance } = await supabase
    .from('hr_attendance')
    .select('*')
    .eq('shop_id', shopId)
    .gte('check_in', today.toISOString())

  // Merge attendance into employees
  const enriched = (employees ?? []).map(emp => ({
    ...emp,
    today_attendance: todayAttendance?.find(a => a.employee_id === emp.id) ?? null,
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      <StaffList employees={enriched} shopId={shopId} />
    </div>
  )
}
