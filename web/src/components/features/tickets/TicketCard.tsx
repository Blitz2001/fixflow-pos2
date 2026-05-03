'use client'

import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Clock, Smartphone, MoreHorizontal } from 'lucide-react'
import type { TicketStatus, TicketPriority } from '@/types/database'

export interface TicketCardData {
  id: string
  ticket_number: string
  status: TicketStatus
  priority: TicketPriority
  created_at: string
  device: { model: string; customer?: { name: string } }
}

interface TicketCardProps {
  ticket: TicketCardData
}

export function TicketCard({ ticket }: TicketCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id, data: { type: 'Ticket', ticket } })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }

  // Format age in days
  const ageDays = Math.floor((Date.now() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Link
      href={`/dashboard/tickets/${ticket.id}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`block bg-card border border-border rounded-2xl p-4 shadow-sm text-left cursor-grab active:cursor-grabbing hover:border-brand-300 hover:shadow-xl transition-all ${
        isDragging ? 'opacity-50 ring-2 ring-brand-500' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-black text-foreground px-2 py-1 bg-accent rounded-lg tracking-tight">
          {ticket.ticket_number}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border priority-${ticket.priority}`}>
          {ticket.priority}
        </span>
      </div>

      <div className="flex items-center gap-2.5 mb-1">
        <Smartphone className="w-4 h-4 text-brand-500 shrink-0" />
        <p className="text-sm font-black text-foreground truncate tracking-tight">
          {ticket.device.model}
        </p>
      </div>

      <p className="text-xs font-bold text-muted-foreground truncate mb-4 pl-6.5 opacity-80">
        {ticket.device.customer?.name ?? 'Unknown Customer'}
      </p>

      <div className="flex items-center justify-between mt-auto border-t border-border/50 pt-3">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
          <Clock className="w-3.5 h-3.5" />
          {ageDays === 0 ? 'Today' : `${ageDays}d ago`}
        </div>
        <div className="p-1.5 hover:bg-muted rounded-lg transition-colors">
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </Link>
  )
}
