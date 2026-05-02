'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addExpense } from '@/lib/actions/finance'
import { toast } from 'sonner'
import { Loader2, PlusCircle, Receipt } from 'lucide-react'

export function ExpenseForm({ shopId }: { shopId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category || !amount) {
      toast.error('Please fill in required fields')
      return
    }

    setLoading(true)
    try {
      await addExpense({
        shop_id: shopId,
        category,
        amount: Number(amount),
        description,
        expense_date: new Date().toISOString().split('T')[0]
      })
      toast.success('Expense recorded successfully!')
      setCategory('')
      setAmount('')
      setDescription('')
      // Server action revalidatePath will handle refresh
    } catch (err: any) {
      toast.error(err.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
      <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground mb-4">
        <PlusCircle className="w-5 h-5 text-brand-500" /> Log New Expense
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Category *</label>
          <select 
            className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select...</option>
            <option value="Rent">Rent</option>
            <option value="Salary">Salary</option>
            <option value="Utilities">Utilities</option>
            <option value="Parts Purchase">Parts Purchase</option>
            <option value="Marketing">Marketing</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount (LKR) *</label>
          <input 
            type="number" 
            min="0"
            step="0.01"
            className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
          <input 
            type="text" 
            placeholder="e.g. Electricity Bill May"
            className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={loading || !category || !amount}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />} Record Expense
        </button>
      </div>
    </form>
  )
}
