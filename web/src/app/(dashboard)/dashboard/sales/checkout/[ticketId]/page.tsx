import { createServerClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Ticket } from 'lucide-react'
import { CheckoutForm } from '@/components/features/sales/CheckoutForm'

interface CheckoutPageProps {
  params: Promise<{ ticketId: string }>
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { ticketId } = await params
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('shop_id')
    .eq('user_id', user.id)
    .single()
  if (!membership) redirect('/onboarding')

  // Fetch the ticket
  const { data: ticket, error } = await supabase
    .from('repair_tickets')
    .select(`
      *,
      customer:customers(name, phone_number),
      assigned_parts:serial_numbers(
        id,
        serial_number,
        item:inventory_items(name, sell_price)
      )
    `)
    .eq('id', ticketId)
    .eq('shop_id', membership.shop_id)
    .single()

  if (error || !ticket) notFound()

  // If already paid/completed, don't allow double checkout
  if (ticket.status === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-2">
          <Ticket className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Ticket Already Completed</h2>
        <p className="text-muted-foreground text-sm">This ticket has already been paid and closed.</p>
        <Link href="/dashboard/sales" className="text-brand-500 hover:underline">View Sales History</Link>
      </div>
    )
  }

  const partsTotal = (ticket.assigned_parts || []).reduce((acc: number, p: any) => acc + (p.item?.sell_price || 0), 0)

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/dashboard/tickets/${ticketId}`} className="p-2 hover:bg-accent rounded-xl transition-colors text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Ticket <span className="font-mono text-foreground font-semibold">{ticket.ticket_number}</span> • {ticket.customer?.name}
          </p>
        </div>
      </div>

      <CheckoutForm 
        ticketId={ticket.id} 
        shopId={ticket.shop_id} 
        partsTotal={partsTotal} 
        parts={ticket.assigned_parts || []} 
      />
    </div>
  )
}
