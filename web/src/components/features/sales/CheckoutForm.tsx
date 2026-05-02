'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { processCheckout } from '@/lib/actions/finance'
import { toast } from 'sonner'
import { Loader2, Receipt, CreditCard, Banknote, Landmark, SmartphoneNfc } from 'lucide-react'

export function CheckoutForm({ ticketId, shopId, partsTotal, parts }: { ticketId: string, shopId: string, partsTotal: number, parts: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [laborCharge, setLaborCharge] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)
  const [paymentType, setPaymentType] = useState('Cash')

  const subtotal = partsTotal + (laborCharge || 0)
  const grandTotal = subtotal - (discount || 0)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      await processCheckout(ticketId, shopId, paymentType, laborCharge || 0, discount || 0)
      toast.success('Payment processed successfully!')
      router.push('/dashboard/sales')
    } catch (e: any) {
      toast.error(e.message || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* Left Column: Summary */}
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground border-b border-border pb-4">
            <Receipt className="w-5 h-5 text-brand-500" /> Invoice Summary
          </h2>

          <div className="space-y-4">
            {parts.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{p.item?.name} <span className="text-xs ml-1 opacity-50">({p.serial_number})</span></span>
                <span className="font-medium text-foreground">{p.item?.sell_price} LKR</span>
              </div>
            ))}
            
            {parts.length > 0 && <div className="border-t border-border border-dashed my-2"></div>}
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Parts Total</span>
              <span className="font-semibold text-foreground">{partsTotal} LKR</span>
            </div>

            <div className="pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Labor / Service Charge (LKR)</label>
                <input 
                  type="number" 
                  min="0"
                  value={laborCharge}
                  onChange={(e) => setLaborCharge(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500 font-medium" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Discount (LKR)</label>
                <input 
                  type="number" 
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500 font-medium text-red-400" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Payment */}
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Payment Details</h2>

          <div className="bg-accent/30 rounded-xl p-4 mb-6 border border-border text-center">
            <p className="text-sm text-muted-foreground mb-1">Amount Due</p>
            <p className="text-4xl font-bold text-brand-500">{grandTotal} LKR</p>
          </div>

          <label className="block text-sm font-medium text-slate-300 mb-3">Payment Method</label>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              onClick={() => setPaymentType('Cash')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${paymentType === 'Cash' ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'bg-background border-border text-muted-foreground hover:bg-accent'}`}
            >
              <Banknote className="w-4 h-4" /> Cash
            </button>
            <button
              onClick={() => setPaymentType('Card')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${paymentType === 'Card' ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'bg-background border-border text-muted-foreground hover:bg-accent'}`}
            >
              <CreditCard className="w-4 h-4" /> Card
            </button>
            <button
              onClick={() => setPaymentType('Bank Transfer')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${paymentType === 'Bank Transfer' ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'bg-background border-border text-muted-foreground hover:bg-accent'}`}
            >
              <Landmark className="w-4 h-4" /> Transfer
            </button>
            <button
              onClick={() => setPaymentType('QR')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${paymentType === 'QR' ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'bg-background border-border text-muted-foreground hover:bg-accent'}`}
            >
              <SmartphoneNfc className="w-4 h-4" /> QR Pay
            </button>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || grandTotal < 0}
            className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-lg"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Receipt className="w-6 h-6" />} Complete Transaction
          </button>
        </div>
      </div>

    </div>
  )
}
