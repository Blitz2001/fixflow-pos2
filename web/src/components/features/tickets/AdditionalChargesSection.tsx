'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Loader2, Banknote } from 'lucide-react'
import { updateAdditionalCharges } from '@/lib/actions/tickets'
import { toast } from 'sonner'

interface Charge {
  description: string
  amount: number
}

interface AdditionalChargesSectionProps {
  ticketId: string
  initialCharges: Charge[]
  shopCurrency?: string
}

export function AdditionalChargesSection({ ticketId, initialCharges, shopCurrency }: AdditionalChargesSectionProps) {
  const [isPending, startTransition] = useTransition()
  const [charges, setCharges] = useState<Charge[]>(initialCharges)
  const [newDesc, setNewDesc] = useState('')
  const [newAmount, setNewAmount] = useState('')

  const handleAddCharge = () => {
    if (!newDesc.trim() || !newAmount) return
    
    const newCharge = { description: newDesc, amount: Number(newAmount) }
    const updatedCharges = [...charges, newCharge]
    
    setCharges(updatedCharges)
    setNewDesc('')
    setNewAmount('')
    
    saveCharges(updatedCharges)
  }

  const handleRemoveCharge = (index: number) => {
    const updatedCharges = charges.filter((_, i) => i !== index)
    setCharges(updatedCharges)
    saveCharges(updatedCharges)
  }

  const saveCharges = (updatedCharges: Charge[]) => {
    startTransition(async () => {
      try {
        await updateAdditionalCharges(ticketId, updatedCharges)
        toast.success('Additional charges updated')
      } catch (err: any) {
        toast.error('Failed to save: ' + err.message)
      }
    })
  }

  return (
    <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm">
      <h2 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
        <Banknote className="w-5 h-5 text-brand-500" /> Labor & Charges
      </h2>

      <div className="space-y-3 mb-5">
        {charges.map((charge, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50 group">
            <div>
              <p className="text-sm font-bold text-foreground">{charge.description}</p>
              <p className="text-xs text-muted-foreground">{charge.amount} {shopCurrency || 'LKR'}</p>
            </div>
            <button 
              onClick={() => handleRemoveCharge(i)}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {charges.length === 0 && (
          <p className="text-sm text-muted-foreground italic text-center py-4 bg-muted/5 rounded-xl border border-dashed border-border">
            No labor added.
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input 
            type="text" 
            placeholder="Description" 
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
          <input 
            type="number" 
            placeholder="Amount" 
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
        </div>
        <button 
          onClick={handleAddCharge}
          disabled={isPending || !newDesc || !newAmount}
          className="w-full flex items-center justify-center gap-2 py-3 bg-foreground text-background font-black rounded-xl text-xs uppercase tracking-widest hover:bg-foreground/90 transition-all disabled:opacity-50 shadow-sm"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Labor Charge
        </button>
      </div>
    </div>
  )
}
