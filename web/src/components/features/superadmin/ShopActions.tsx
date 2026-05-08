'use client'

import { useState } from 'react'
import { Trash2, AlertCircle, PlayCircle } from 'lucide-react'
import { toggleShopLock, deleteShop } from '@/lib/actions/superadmin-ops'

interface ShopActionsProps {
  shopId: string
  taxEnabled: boolean
}

export default function ShopActions({ shopId, taxEnabled }: ShopActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const handleDelete = async () => {
    if (!confirm('CRITICAL ACTION: Are you sure you want to OBLITERATE this shop? All data, tickets, and customers will be permanently deleted. This cannot be undone.')) {
      return
    }
    
    setIsDeleting(true)
    try {
      await deleteShop(shopId)
    } catch (err) {
      alert('Failed to delete shop: ' + (err instanceof Error ? err.message : 'Unknown error'))
      setIsDeleting(false)
    }
  }

  const handleToggleLock = async () => {
    setIsToggling(true)
    try {
      await toggleShopLock(shopId, !taxEnabled)
    } catch (err) {
      alert('Failed to toggle shop status: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <div className="flex items-center gap-2 xl:w-auto shrink-0 justify-end flex-wrap">
      {/* Status Action */}
      <button 
        onClick={handleToggleLock}
        disabled={isToggling}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all text-xs font-bold disabled:opacity-50 shadow-sm ${
          taxEnabled 
            ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100' 
            : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
        }`}
      >
        {isToggling ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          taxEnabled ? <><AlertCircle className="w-4 h-4" /> Suspend</> : <><PlayCircle className="w-4 h-4" /> Unsuspend</>
        )}
      </button>

      {/* Delete Action */}
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2.5 rounded-xl bg-slate-50 text-slate-300 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 transition-all disabled:opacity-50 shadow-sm"
        title="Delete Shop"
      >
        {isDeleting ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}
