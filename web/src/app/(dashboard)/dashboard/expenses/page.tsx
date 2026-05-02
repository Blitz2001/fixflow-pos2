import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExpenseForm } from '@/components/features/sales/ExpenseForm'

export default async function ExpensesPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('shop_id')
    .eq('user_id', user.id)
    .single()
  if (!membership) redirect('/onboarding')

  const { data: expenses } = await supabase
    .from('expenses')
    .select(`*, profile:profiles(full_name)`)
    .eq('shop_id', membership.shop_id)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track your shop's outgoing money.</p>
        </div>
      </div>

      <ExpenseForm shopId={membership.shop_id} />

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-accent/30">
          <h2 className="font-semibold text-foreground">Recent Expenses</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-foreground">Date</th>
                <th className="px-6 py-4 font-semibold text-foreground">Category</th>
                <th className="px-6 py-4 font-semibold text-foreground">Description</th>
                <th className="px-6 py-4 font-semibold text-foreground">Amount</th>
                <th className="px-6 py-4 font-semibold text-foreground">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {expenses && expenses.length > 0 ? (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {new Date(exp.expense_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-accent border border-border text-foreground">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {exp.description || '-'}
                    </td>
                    <td className="px-6 py-4 font-bold text-red-400">
                      -{exp.amount} LKR
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {exp.profile?.full_name || 'System'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No expenses recorded yet.
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
