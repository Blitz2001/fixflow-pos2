import { Plus } from 'lucide-react'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { KanbanBoard } from '@/components/features/tickets/KanbanBoard'
import type { TicketCardData } from '@/components/features/tickets/TicketCard'

export default async function TicketsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('memberships')
    .select('shop_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) return null

  // Fetch all non-archived tickets for the Kanban board
  const { data: tickets } = await supabase
    .from('repair_tickets')
    .select(`
      id,
      ticket_number,
      status,
      priority,
      created_at,
      device:devices(model, customer:customers(name))
    `)
    .eq('shop_id', membership.shop_id)
    .not('status', 'in', '("delivered","cancelled")')
    .order('created_at', { ascending: false })

  const typedTickets = (tickets ?? []) as unknown as TicketCardData[]

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-48px)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Repair Tickets</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Drag and drop to update statuses</p>
        </div>
        <Link href="/dashboard/tickets/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New Ticket
        </Link>
      </div>
      
      {/* Kanban Board takes remaining height */}
      <div className="flex-1 min-h-0 -mx-6 px-6">
        <KanbanBoard initialTickets={typedTickets} />
      </div>
    </div>
  )
}
