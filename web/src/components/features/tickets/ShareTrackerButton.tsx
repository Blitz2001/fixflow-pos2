'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'sonner'

export function ShareTrackerButton({ ticketId }: { ticketId: string }) {
  const copyLink = () => {
    const url = `${window.location.origin}/track/${ticketId}`
    navigator.clipboard.writeText(url)
    toast.success('Tracking link copied to clipboard!')
  }

  return (
    <button 
      onClick={copyLink}
      className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
    >
      <Share2 className="w-3.5 h-3.5" />
      Share Tracker
    </button>
  )
}
