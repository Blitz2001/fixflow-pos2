'use client'

import { useState } from 'react'
import { Clock } from 'lucide-react'
import { TimeClockModal } from './TimeClockModal'

interface TimeClockActionProps {
  shopId: string
}

export function TimeClockAction({ shopId }: TimeClockActionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-brand-50 hover:border-brand-200 transition-all text-sm font-bold text-brand-600 group"
      >
        <Clock className="w-5 h-5 text-brand-500" />
        Staff Time Clock
      </button>

      <TimeClockModal 
        shopId={shopId} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  )
}
