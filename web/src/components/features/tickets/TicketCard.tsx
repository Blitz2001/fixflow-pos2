'use client'

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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-card border border-border rounded-xl p-4 shadow-sm text-left cursor-grab active:cursor-grabbing hover:border-brand-300 transition-colors ${
        isDragging ? 'opacity-50 ring-2 ring-brand-500' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-foreground px-2 py-0.5 bg-accent rounded-md">
          {ticket.ticket_number}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide priority-${ticket.priority}`}>
          {ticket.priority.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <Smartphone className="w-4 h-4 text-muted-foreground shrink-0" />
        <p className="text-sm font-semibold text-foreground truncate">
          {ticket.device.model}
        </p>
      </div>

      <p className="text-xs text-muted-foreground truncate mb-4 pl-6">
        {ticket.device.customer?.name ?? 'Unknown Customer'}
      </p>

      <div className="flex items-center justify-between mt-auto border-t border-border pt-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          {ageDays === 0 ? 'Today' : `${ageDays}d ago`}
        </div>
        <button className="p-1 hover:bg-accent rounded-md transition-colors text-muted-foreground">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
