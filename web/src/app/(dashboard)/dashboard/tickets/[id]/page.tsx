import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, User, Smartphone, FileText, Camera } from 'lucide-react'
import { AssignPartSection } from '@/components/features/inventory/AssignPartSection'

interface TicketDetailPageProps {
  params: Promise<{ id: string }>
}
import { StatusSelector } from '@/components/features/tickets/StatusSelector'

import { AdditionalChargesSection } from '@/components/features/tickets/AdditionalChargesSection'

import { RepairChecklist } from '@/components/features/tickets/RepairChecklist'

import { ShareTrackerButton } from '@/components/features/tickets/ShareTrackerButton'

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  // Fetch the ticket with joined relations
  const { data: ticket, error } = await supabase
    .from('repair_tickets')
    .select(`
      *,
      device:devices (
        brand,
        model,
        serial_number,
        partner:partners (name, phone, email)
      ),
      evidence_logs (photo_url),
      assigned_parts:serial_numbers (
        id,
        serial_number,
        item:inventory_items (name, sell_price)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !ticket) {
    notFound()
  }

  // Fetch shop info for WhatsApp and display
  const { data: shop } = await supabase
    .from('shops')
    .select('name, currency')
    .eq('id', ticket.shop_id)
    .single()

  if (!shop) notFound()

  // Calculate age
  const ageDays = Math.floor((Date.now() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60 * 24))

  // Calculate totals
  const metadata = (ticket.metadata as any) || {}
  const additionalCharges = (metadata.additional_charges as any[]) || []
  const additionalTotal = additionalCharges.reduce((acc, c) => acc + (Number(c.amount) || 0), 0)
  
  const partsTotal = (ticket.assigned_parts as any[])?.reduce((acc, p) => acc + (p.item?.sell_price || 0), 0) || 0
  
  const totalCost = partsTotal + additionalTotal
  return (
    <div className="w-full animate-fade-in pb-24">
      {/* Readable Header */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl mb-4 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/tickets" className="p-2 hover:bg-brand-50 rounded-xl transition-all border border-transparent hover:border-brand-100">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight mb-1">{ticket.ticket_number}</h1>
            <div className="flex items-center gap-4">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold tracking-widest border priority-${ticket.priority}`}>
                {ticket.priority.toUpperCase()} PRIORITY
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <Clock className="w-4 h-4" />
                RECEIVED {ageDays === 0 ? 'TODAY' : `${ageDays} DAYS AGO`}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ShareTrackerButton ticketId={ticket.id} />
          <StatusSelector 
            ticketId={ticket.id} 
            currentStatus={ticket.status} 
            shopName={shop.name}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        
        {/* Column 1: Issue */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-brand-500" />
              <h2 className="text-xs font-black text-foreground uppercase tracking-widest">Reported Issue</h2>
            </div>
            <div className="p-5">
              <p className="text-base text-foreground font-medium leading-relaxed">{ticket.issue_description}</p>
              {ticket.accessories_included && (ticket.accessories_included as string[]).length > 0 && (
                <div className="mt-4 pt-4 border-t border-border border-dashed">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Accessories</p>
                  <div className="flex flex-wrap gap-2">
                    {(ticket.accessories_included as string[]).map((acc, i) => (
                      <span key={i} className="px-2.5 py-1 bg-muted border border-border rounded-lg text-xs font-bold text-foreground/80">
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <RepairChecklist 
            ticketId={ticket.id} 
            initialChecklist={(metadata.repair_checklist as any[]) || []} 
          />
        </div>

        {/* Column 2: Customer & Device */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-sm p-5 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Customer Information</p>
                <h3 className="text-base font-bold text-foreground">{ticket.device?.partner?.name || 'Unknown'}</h3>
                <p className="text-sm text-muted-foreground font-medium">{ticket.device?.partner?.phone || 'N/A'}</p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-border flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Device Details</p>
                <h3 className="text-base font-bold text-foreground">{ticket.device?.brand} {ticket.device?.model}</h3>
                <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded inline-block mt-2">
                  {ticket.device?.serial_number || 'NO SERIAL'}
                </p>
              </div>
            </div>
          </div>

          {ticket.evidence_logs && ticket.evidence_logs.length > 0 && (
            <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center gap-2">
                <Camera className="w-4 h-4 text-brand-500" />
                <h2 className="text-[10px] font-black text-foreground uppercase tracking-wider">Evidence Logs</h2>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-4 gap-2">
                  {ticket.evidence_logs.map((log: any, i: number) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border bg-muted">
                      <img src={log.photo_url} alt="Evidence" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Column 3: Management */}
        <div className="space-y-4">
          <AdditionalChargesSection 
            ticketId={ticket.id} 
            initialCharges={additionalCharges} 
            shopCurrency={shop.currency}
          />
          <AssignPartSection 
            ticketId={ticket.id} 
            shopId={ticket.shop_id} 
            currentAssignedSerials={ticket.assigned_parts || []} 
          />
        </div>
      </div>

      {/* Refined Floating Checkout Pill */}
      <div className="fixed bottom-7 left-[264px] z-20">
        <div className="bg-brand-500 rounded-2xl p-5 shadow-2xl shadow-brand-500/40 text-white flex items-center gap-10 border border-white/20 backdrop-blur-sm">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-100 mb-1">Service & Labor</p>
              <p className="text-lg font-bold">{additionalTotal} {shop.currency}</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-100 mb-1">Inventory Parts</p>
              <p className="text-lg font-bold">{partsTotal} {shop.currency}</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-100 mb-1">Final Balance</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black tracking-tight">{totalCost}</span>
                <span className="text-[10px] font-black text-brand-100 uppercase">{shop.currency}</span>
              </div>
            </div>
          </div>

          {ticket.status !== 'delivered' && (
            <Link 
              href={`/dashboard/sales/checkout/${ticket.id}`}
              className="bg-white text-brand-500 font-black px-8 py-3.5 rounded-xl uppercase tracking-widest text-xs shadow-xl hover:bg-brand-50 transition-all hover:scale-105 active:scale-95"
            >
              Complete & Checkout
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
