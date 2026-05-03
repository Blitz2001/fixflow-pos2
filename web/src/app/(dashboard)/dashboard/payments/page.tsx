import { createServerClient } from '@/lib/supabase/server'
import { Landmark, Banknote, ArrowUpCircle, ArrowDownCircle, Wallet, Plus, Search, Filter } from 'lucide-react'
import { PaymentActionCards } from '@/components/features/payments/PaymentActionCards'

export default async function PaymentsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('memberships')
    .select('shop_id')
    .eq('user_id', user.id)
    .single()

  let suppliers = []
  if (membership) {
    const { data } = await supabase
      .from('partners')
      .select('id, name')
      .eq('shop_id', membership.shop_id)
      .contains('partner_types', ['is_supplier'])
      
    suppliers = data || []
  }

  // Mock financial stats
  const stats = {
    totalGiven: 125000,
    totalReceived: 85000,
    chequesInHand: 45000,
    chequesGiven: 60000
  }

  return (
    <div className="animate-fade-in pb-12 px-6 pt-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Financial Payments</h1>
        <p className="text-muted-foreground text-sm font-medium mt-1">Manage all Money & Cheque transactions for your shop.</p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Money Given</span>
          </div>
          <p className="text-xl font-black text-emerald-700 tracking-tight">{stats.totalGiven.toLocaleString()} LKR</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <ArrowDownCircle className="w-5 h-5 text-amber-600" />
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Money Received</span>
          </div>
          <p className="text-xl font-black text-amber-700 tracking-tight">{stats.totalReceived.toLocaleString()} LKR</p>
        </div>
        <div className="bg-brand-500/10 border border-brand-500/20 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <Landmark className="w-5 h-5 text-brand-600" />
            <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Cheques Given</span>
          </div>
          <p className="text-xl font-black text-brand-700 tracking-tight">{stats.chequesGiven.toLocaleString()} LKR</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-5 h-5 text-purple-600" />
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Cheques In Hand</span>
          </div>
          <p className="text-xl font-black text-purple-700 tracking-tight">{stats.chequesInHand.toLocaleString()} LKR</p>
        </div>
      </div>

      {/* SEPARATE DIRECT ACTIONS */}
      <PaymentActionCards suppliers={suppliers || []} />

      {/* Recent Ledger History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">Master Payment Ledger</h2>
          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-accent/50 rounded-xl hover:bg-accent transition-colors"><Search className="w-4 h-4" /></button>
            <button className="p-2.5 bg-accent/50 rounded-xl hover:bg-accent transition-colors"><Filter className="w-4 h-4" /></button>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px]">Date</th>
                <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px]">Supplier</th>
                <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px]">Method</th>
                <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px]">Ref / Chq</th>
                <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px]">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Mock entries */}
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="px-8 py-5 font-bold text-muted-foreground">Today</td>
                <td className="px-8 py-5 font-black text-foreground">Apex Tech</td>
                <td className="px-8 py-5 font-bold text-emerald-600">GIVEN (Cash)</td>
                <td className="px-8 py-5 font-mono text-xs text-muted-foreground">-</td>
                <td className="px-8 py-5 font-black text-base text-emerald-600">- 25,000</td>
              </tr>
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="px-8 py-5 font-bold text-muted-foreground">Yesterday</td>
                <td className="px-8 py-5 font-black text-foreground">Global Parts</td>
                <td className="px-8 py-5 font-bold text-brand-600">GIVEN (Cheque)</td>
                <td className="px-8 py-5 font-mono text-xs text-foreground bg-accent/50 px-2 py-1 rounded-lg">CHQ-998822</td>
                <td className="px-8 py-5 font-black text-base text-emerald-600">- 50,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
