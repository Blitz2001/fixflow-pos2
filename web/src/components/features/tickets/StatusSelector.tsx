'use client'

import { useState, useTransition } from 'react'
import { updateTicketStatus, getWhatsAppUpdateLink } from '@/lib/actions/tickets'
import { toast } from 'sonner'
import { 
  Check, ChevronDown, Loader2, MessageCircle, 
  Inbox, Search, Clock, Wrench, PartyPopper, Send 
} from 'lucide-react'
import type { TicketStatus } from '@/types/database'

const STATUSES: { id: TicketStatus; label: string; icon: any; colorClass: string; bgClass: string }[] = [
  { id: 'intake',        label: 'Received',        icon: Inbox,       colorClass: 'text-blue-500',   bgClass: 'bg-blue-500/10' },
  { id: 'diagnosing',    label: 'Diagnosing',      icon: Search,      colorClass: 'text-amber-500',  bgClass: 'bg-amber-500/10' },
  { id: 'waiting_parts', label: 'Waiting Parts',   icon: Clock,       colorClass: 'text-rose-500',   bgClass: 'bg-rose-500/10' },
  { id: 'repairing',     label: 'Repairing',       icon: Wrench,      colorClass: 'text-brand-500',  bgClass: 'bg-brand-500/10' },
  { id: 'ready',         label: 'Ready to Ship',   icon: PartyPopper, colorClass: 'text-emerald-500',bgClass: 'bg-emerald-500/10' },
  { id: 'delivered',     label: 'Delivered',       icon: Send,        colorClass: 'text-purple-500', bgClass: 'bg-purple-500/10' },
]

interface StatusSelectorProps {
  ticketId: string
  currentStatus: TicketStatus
  shopName: string
}

export function StatusSelector({ ticketId, currentStatus, shopName }: StatusSelectorProps) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [waLink, setWaLink] = useState<string | null>(null)

  const currentStatusInfo = STATUSES.find(s => s.id === currentStatus) || STATUSES[0]
  const Icon = currentStatusInfo.icon

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (newStatus === currentStatus) return
    
    setIsOpen(false)
    setWaLink(null)
    startTransition(async () => {
      try {
        await updateTicketStatus(ticketId, newStatus)
        const link = await getWhatsAppUpdateLink(ticketId, shopName)
        setWaLink(link)
        toast.success(`Status updated. You can now send a WhatsApp update.`, {
          action: {
            label: 'Send WhatsApp',
            onClick: () => window.open(link, '_blank')
          }
        })
      } catch (err: any) {
        toast.error('Failed to update status: ' + err.message)
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative inline-block text-left">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          disabled={isPending}
          className={`group flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs font-black tracking-widest border border-border shadow-sm transition-all hover:scale-105 active:scale-95 ${currentStatusInfo.bgClass} ${currentStatusInfo.colorClass} disabled:opacity-50 relative overflow-hidden`}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Icon className="w-4 h-4" />
          )}
          {currentStatusInfo.label.toUpperCase()}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          
          {/* Subtle pulse effect */}
          <span className="absolute inset-0 bg-current opacity-0 group-hover:opacity-5 transition-opacity" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-3 w-64 rounded-3xl bg-white dark:bg-card border border-border shadow-2xl z-40 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
              <div className="p-2 space-y-1">
                <p className="px-4 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Update Repair Status</p>
                {STATUSES.map((status) => {
                  const SIcon = status.icon
                  const active = currentStatus === status.id
                  return (
                    <button
                      key={status.id}
                      onClick={() => handleStatusChange(status.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${
                        active 
                          ? `${status.bgClass} ${status.colorClass}` 
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl transition-all ${active ? 'bg-white shadow-sm' : `${status.bgClass} ${status.colorClass}`}`}>
                          <SIcon className="w-4 h-4" />
                        </div>
                        <span className={`text-sm font-bold ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                          {status.label}
                        </span>
                      </div>
                      {active && (
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {waLink && (
        <a 
          href={waLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-[11px] font-black tracking-widest bg-emerald-500 text-white hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20 animate-in slide-in-from-left-4"
        >
          <MessageCircle className="w-4 h-4 fill-white/20" /> WHATSAPP CUSTOMER
        </a>
      )}
    </div>
  )
}
