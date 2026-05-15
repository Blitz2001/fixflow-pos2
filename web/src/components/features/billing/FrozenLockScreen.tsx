'use client'

import { AlertCircle, CreditCard, Lock, MessageSquare } from 'lucide-react'
import { processSubscriptionPayment } from '@/lib/actions/billing'
import { useState } from 'react'

interface Props {
  shopId: string
  shopName: string
  amountDue: number
}

export function FrozenLockScreen({ shopId, shopName, amountDue }: Props) {
  const [loading, setLoading] = useState(false)

  const handleMockPayment = async () => {
    setLoading(true)
    try {
      // Simulate a payment gateway delay
      await new Promise(r => setTimeout(r, 2000))
      const txId = `MOCK-SUB-${Math.random().toString(36).toUpperCase().slice(2, 10)}`
      await processSubscriptionPayment(shopId, amountDue, txId)
      window.location.reload()
    } catch (e) {
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50/95 backdrop-blur-sm animate-fade-in px-4">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[3rem] p-12 shadow-2xl shadow-slate-200/50 text-center relative overflow-hidden">
        {/* Design accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-50 rounded-full blur-3xl -ml-16 -mb-16 opacity-50" />

        <div className="relative z-10">
          <div className="w-24 h-24 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Lock className="w-10 h-10 text-rose-500 animate-pulse" />
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">
            Instance Frozen
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">
            {shopName} • Subscription Required
          </p>

          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 mb-10 text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Monthly Commitment</span>
              <span className="text-xl font-black text-slate-900">LKR {amountDue.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-3 text-rose-500 bg-rose-50 p-4 rounded-2xl border border-rose-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold leading-relaxed">
                Your shop has been frozen due to a missed payment. Access to all inventory, tickets, and financial modules is restricted until payment is resolved.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={handleMockPayment}
              disabled={loading}
              className="px-8 py-5 rounded-2xl bg-slate-900 text-white font-black text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {loading ? 'Processing...' : 'Secure Pay Now'}
            </button>
            <button 
              className="px-8 py-5 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              onClick={() => window.open('https://support.repair-os.com', '_blank')}
            >
              <MessageSquare className="w-5 h-5" />
              Contact Billing
            </button>
          </div>

          <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Automatic restoration will occur immediately after confirmation.
          </p>
        </div>
      </div>
    </div>
  )
}
