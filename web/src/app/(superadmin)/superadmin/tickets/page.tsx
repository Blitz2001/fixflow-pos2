import { getSupportTickets } from '@/lib/actions/superadmin'
import SuperAdminTicketsWorkspace from '@/components/features/superadmin/SuperAdminTicketsWorkspace'

export default async function SupportTicketsPage() {
  const tickets = await getSupportTickets()

  return (
    <div className="space-y-6">
      <SuperAdminTicketsWorkspace initialTickets={tickets} />
    </div>
  )
}
