'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addSerialNumbers } from '@/lib/actions/inventory'
import { toast } from 'sonner'
import { Loader2, Plus, QrCode } from 'lucide-react'

export function AddSerialsModal({ itemId, shopId }: { itemId: string, shopId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [serialsText, setSerialsText] = useState('')

  const handleAdd = async () => {
    // Parse serials by newline or comma
    const serials = serialsText
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)

    if (serials.length === 0) {
      toast.error('Please enter at least one serial number')
      return
    }

    setLoading(true)
    try {
      await addSerialNumbers(itemId, shopId, serials)
      toast.success(`Successfully added ${serials.length} serial numbers!`)
      setSerialsText('')
      router.refresh()
    } catch (e: any) {
      toast.error(e.message || 'Failed to add serial numbers')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground">
        <QrCode className="w-5 h-5 text-brand-500" /> Receive New Stock
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Scan or type serial numbers below. Separate multiple serial numbers with commas or new lines.
      </p>
      <textarea
        value={serialsText}
        onChange={(e) => setSerialsText(e.target.value)}
        placeholder="SN123456789&#10;SN987654321"
        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500 min-h-[120px] font-mono text-sm mb-4"
      />
      <button
        onClick={handleAdd}
        disabled={loading || serialsText.trim() === ''}
        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add to Inventory
      </button>
    </div>
  )
}
