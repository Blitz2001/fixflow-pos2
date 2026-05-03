'use client'

import { useTransition } from 'react'
import { openShop, closeShop } from '@/lib/actions/shop-session'
import { toast } from 'sonner'
import { Store, StoreIcon, Clock, Loader2 } from 'lucide-react'

interface ShopSessionWidgetProps {
  shopId: string
  currentSession: {
    id: string
    opened_at: string
    closed_at: string | null
  } | null
}

function formatDuration(from: string): string {
  const ms = Date.now() - new Date(from).getTime()
  const hrs = Math.floor(ms / 3_600_000)
  const mins = Math.floor((ms % 3_600_000) / 60_000)
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`
}

export function ShopSessionWidget({ shopId, currentSession }: ShopSessionWidgetProps) {
  const [isPending, startTransition] = useTransition()
  const isOpen = currentSession && !currentSession.closed_at

  const handleToggle = () => {
    startTransition(async () => {
      try {
        if (isOpen) {
          await closeShop(shopId)
          toast.info('Shop closed. Have a good evening!')
        } else {
          await openShop(shopId)
          toast.success('Shop is now open!')
        }
      } catch (err: any) {
        toast.error(err.message)
      }
    })
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
      isOpen
        ? 'bg-emerald-500/5 border-emerald-500/30'
        : 'bg-card border-border'
    }`}>
      {/* Decorative BG icon */}
      <Store className="absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.04] pointer-events-none" />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Shop Status</p>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
            <p className="text-xl font-black text-foreground">{isOpen ? 'OPEN' : 'CLOSED'}</p>
          </div>

          {isOpen && currentSession && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Since {new Date(currentSession.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {' · '}{formatDuration(currentSession.opened_at)} open
              </span>
            </div>
          )}

          {!isOpen && currentSession?.closed_at && (
            <p className="text-xs text-muted-foreground mt-1">
              Closed at {new Date(currentSession.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 shrink-0 ${
            isOpen
              ? 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20'
              : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
          }`}
        >
          {isPending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <StoreIcon className="w-4 h-4" />
          }
          {isOpen ? 'Close Shop' : 'Open Shop'}
        </button>
      </div>
    </div>
  )
}
