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
      customer:customers(name)
    `)
    .eq('shop_id', membership.shop_id)
    .order('created_at', { ascending: false })

  const totalSales = (transactions || []).reduce((acc, t) => acc + t.grand_total, 0)

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales & Transactions</h1>
          <p className="text-muted-foreground text-sm mt-0.5">View all completed checkout records.</p>
        </div>
        <Link href="/dashboard/sales/new" className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm">
          New Sale
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-brand-500/10 border border-brand-500/20 p-5 rounded-2xl">
          <p className="text-sm font-medium text-brand-600 dark:text-brand-400 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-foreground">{totalSales} LKR</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl">
          <p className="text-sm font-medium text-muted-foreground mb-1">Transactions</p>
          <p className="text-2xl font-bold text-foreground">{transactions?.length || 0}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-foreground">Date</th>
                <th className="px-6 py-4 font-semibold text-foreground">Ticket / Type</th>
                <th className="px-6 py-4 font-semibold text-foreground">Customer</th>
                <th className="px-6 py-4 font-semibold text-foreground">Payment Method</th>
                <th className="px-6 py-4 font-semibold text-foreground">Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions && transactions.length > 0 ? (
                transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {new Date(txn.paid_at || txn.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {txn.ticket ? (
                        <Link href={`/dashboard/tickets/${txn.ticket_id}`} className="font-medium text-brand-500 hover:underline flex items-center gap-1">
                          {txn.ticket.ticket_number} <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-muted-foreground capitalize">{txn.type.replace('_', ' ')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {txn.customer?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-accent border border-border text-foreground">
                        {txn.payment_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {txn.grand_total} LKR
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Simple visual receipt popout or link can go here */}
                      <button className="text-brand-500 hover:bg-brand-500/10 p-2 rounded-xl transition-colors">
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No transactions recorded yet. Complete a checkout to see it here!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
