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
      device:devices(model, partner:partners(name))
    `)
    .eq('shop_id', membership.shop_id)
    .not('status', 'in', '("delivered","cancelled")')
    .order('created_at', { ascending: false })

  const typedTickets = (tickets ?? []) as unknown as TicketCardData[]

  return (
    <div className="animate-fade-in h-[calc(100vh-16px)] flex flex-col -mx-2 -mt-2 overflow-hidden">
      {/* Header - Minimal height */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/50 dark:bg-card/50 backdrop-blur-sm border-b border-border shrink-0">
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight">Repair Tickets</h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-60">Status Board</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            {typedTickets.length} Active Repairs
          </p>
          <Link href="/dashboard/tickets/new"
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-500/20 active:scale-95">
            <Plus className="w-4 h-4" /> New Ticket
          </Link>
        </div>
      </div>
      
      {/* Kanban Board - Fills everything else */}
      <div className="flex-1 min-h-0">
        <KanbanBoard initialTickets={typedTickets} />
      </div>
    </div>
  )
}
