import { createServerClient } from '@/lib/supabase/server'
import { IntakeForm } from '@/components/features/tickets/IntakeForm'
import { redirect } from 'next/navigation'

export default async function NewTicketPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('shop_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/onboarding')

  return (
    <div className="pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">New Repair Ticket</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Log a new device intake and capture customer details.</p>
      </div>

      <IntakeForm shopId={membership.shop_id} />
    </div>
  )
}
