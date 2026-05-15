import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Receipt, Search, ArrowUpRight } from 'lucide-react'

export default async function SalesPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('shop_id')
    .eq('user_id', user.id)
    .single()
  if (!membership) redirect('/onboarding')

  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      ticket:repair_tickets(ticket_number),
      partner:partners(name)
    `)
    .eq('shop_id', membership.shop_id)
    .order('created_at', { ascending: false })

  const totalSales = (transactions || []).reduce((acc, t) => acc + t.grand_total, 0)

  return (
    <div className="animate-fade-in h-[calc(100vh-16px)] flex flex-col -mx-2 -mt-2 overflow-hidden">
      {/* Premium Header */}
      <div className="flex items-center justify-between px-8 py-6 bg-white/50 dark:bg-card/50 backdrop-blur-xl border-b border-border shrink-0">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Point of Sale</h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Receipts & Transactions</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">System Status</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Terminal
            </span>
          </div>
          <Link href="/dashboard/sales/new" 
            className="flex items-center gap-3 bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-brand-500/20 active:scale-95">
            <Receipt className="w-5 h-5" /> New Sale
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Financial Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-brand-500/10 border border-brand-500/20 p-8 rounded-[32px] relative overflow-hidden group shadow-sm">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] mb-2 opacity-70">Total Revenue</p>
              <p className="text-4xl font-black text-foreground tracking-tight">{totalSales.toLocaleString()} <span className="text-lg opacity-50">LKR</span></p>
            </div>
            <Receipt className="absolute -right-4 -bottom-4 w-32 h-32 text-brand-500/5 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>

          <div className="bg-card border border-border p-8 rounded-[32px] relative overflow-hidden group shadow-sm">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 opacity-70">Volume</p>
              <p className="text-4xl font-black text-foreground tracking-tight">{transactions?.length || 0} <span className="text-lg opacity-50 font-bold uppercase tracking-widest">Txns</span></p>
            </div>
            <Search className="absolute -right-4 -bottom-4 w-32 h-32 text-muted-foreground/5 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>
        </div>

        {/* Transaction Ledger */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">Transaction History</h2>
            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Showing {transactions?.length || 0} records
            </div>
          </div>
          
          <div className="bg-white dark:bg-card border border-border rounded-[32px] overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px]">Date & Time</th>
                  <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px]">Reference</th>
                  <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px]">Customer</th>
                  <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px]">Payment</th>
                  <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px]">Amount</th>
                  <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions && transactions.length > 0 ? (
                  transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-muted/20 transition-all group">
                      <td className="px-8 py-5 text-muted-foreground font-bold whitespace-nowrap">
                        {new Date(txn.paid_at || txn.created_at).toLocaleString('en-US', { 
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </td>
                      <td className="px-8 py-5">
                        {txn.ticket ? (
                          <Link href={`/dashboard/tickets/${txn.ticket_id}`} className="font-black text-brand-500 hover:underline flex items-center gap-1.5">
                            {txn.ticket.ticket_number} <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        ) : (
                          <span className="text-muted-foreground font-black uppercase text-[10px] tracking-widest bg-accent/50 px-2 py-1 rounded-lg">
                            Direct Sale
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5 font-black text-foreground">
                        {txn.partner?.name || <span className="opacity-20">—</span>}
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-accent border border-border text-foreground">
                          {txn.payment_type}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-black text-lg text-foreground tracking-tight">
                        {txn.grand_total.toLocaleString()} <span className="text-[10px] opacity-40">LKR</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="text-brand-500 hover:bg-brand-500 hover:text-white p-3 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-brand-500/20 active:scale-90">
                          <Receipt className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-24 text-center">
                      <Receipt className="w-16 h-16 text-muted-foreground/10 mx-auto mb-4" />
                      <p className="text-xl font-black text-muted-foreground uppercase tracking-tight">No Transactions</p>
                      <p className="text-sm text-muted-foreground/60 mt-1">Receipts will appear here after checkout.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
