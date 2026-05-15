'use client'

import { adminSetSubscriptionStatus } from '@/lib/actions/billing'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props {
  shopId: string
  status: string
}

export function BillingControls({ shopId, status }: Props) {
  const [loading, setLoading] = useState(false)
  const isFrozen = status === 'frozen'

  const handleToggle = async () => {
    setLoading(true)
    try {
      await adminSetSubscriptionStatus(shopId, isFrozen ? 'active' : 'frozen')
      toast.success(isFrozen ? 'Shop activated' : 'Shop frozen')
    } catch (e) {
      toast.error('Operation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={`px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all disabled:opacity-50 ${
        isFrozen 
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600' 
          : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-500 hover:text-white'
      }`}
    >
      {loading ? 'Processing...' : (isFrozen ? 'Unfreeze' : 'Freeze')}
    </button>
  )
}
