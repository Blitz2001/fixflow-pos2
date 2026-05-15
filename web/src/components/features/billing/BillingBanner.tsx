'use client'

import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface Props {
  daysRemaining: number
  isExpired: boolean
}

export function BillingBanner({ daysRemaining, isExpired }: Props) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className={`w-full ${isExpired ? 'bg-rose-500' : 'bg-amber-500'} text-white p-3 flex items-center justify-between px-8 animate-slide-down shadow-lg relative z-[50]`}>
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <p className="text-xs font-black uppercase tracking-widest">
            {isExpired ? 'Subscription Expired' : 'Payment Due Soon'}
          </p>
          <p className="text-[11px] font-bold opacity-90 leading-tight">
            {isExpired 
              ? `Your grace period ends in ${daysRemaining + 2} days. Shop will be frozen after that.`
              : `Your next billing cycle begins in ${daysRemaining} days. Please ensure funds are available.`
            }
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/settings/billing"
          className="px-4 py-1.5 rounded-lg bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
        >
          Pay Now
        </Link>
        <button 
          onClick={() => setVisible(false)}
          className="p-2 hover:bg-white/10 rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
