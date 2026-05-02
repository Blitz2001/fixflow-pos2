import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, User, Smartphone, FileText, Camera } from 'lucide-react'
import { AssignPartSection } from '@/components/features/inventory/AssignPartSection'

interface TicketDetailPageProps {
  params: Promise<{ id: string }>
}

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
        customer:customers (name, phone_number, email)
      ),
      evidence_logs (photo_url),
      assigned_parts:serial_numbers (
        id,
        serial_number,
        item:inventory_items (name, selling_price)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !ticket) {
    notFound()
  }

  // Calculate age
  const ageDays = Math.floor((Date.now() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/tickets" className="p-2 hover:bg-accent rounded-xl transition-colors text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{ticket.ticket_number}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold priority-${ticket.priority}`}>
              {ticket.priority.toUpperCase()}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border border-border status-${ticket.status}`}>
              {ticket.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Created {ageDays === 0 ? 'Today' : `${ageDays} days ago`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Issue Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground">
              <FileText className="w-5 h-5 text-brand-500" /> Issue Description
            </h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{ticket.issue_description}</p>
            
            {ticket.accessories_included && (ticket.accessories_included as string[]).length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-foreground mb-3">Included Accessories:</h3>
                <div className="flex gap-2 flex-wrap">
                  {(ticket.accessories_included as string[]).map((acc, i) => (
                    <span key={i} className="px-2.5 py-1 bg-accent text-muted-foreground rounded-md text-xs font-medium">
                      {acc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Evidence Photos */}
          {ticket.evidence_logs && ticket.evidence_logs.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground">
                <Camera className="w-5 h-5 text-brand-500" /> Evidence Photos
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {ticket.evidence_logs.map((log: any, i: number) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={log.photo_url} alt="Evidence" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Customer & Device */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground">
              <User className="w-5 h-5 text-brand-500" /> Customer
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                <p className="font-medium text-foreground">{ticket.device?.customer?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                <p className="font-medium text-foreground">{ticket.device?.customer?.phone_number || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground">
              <Smartphone className="w-5 h-5 text-brand-500" /> Device
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Model</p>
                <p className="font-medium text-foreground">{ticket.device?.brand} {ticket.device?.model}</p>
              </div>
              {ticket.device?.serial_number && (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Serial Number</p>
                  <p className="font-medium text-foreground font-mono text-sm">{ticket.device.serial_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Parts Integration (Phase 3) */}
          <AssignPartSection 
            ticketId={ticket.id} 
            shopId={ticket.shop_id} 
            currentAssignedSerials={ticket.assigned_parts || []} 
          />

          {ticket.estimated_cost && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">Estimated Cost</p>
              <p className="text-2xl font-bold text-brand-500">
                {ticket.estimated_cost} LKR
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
