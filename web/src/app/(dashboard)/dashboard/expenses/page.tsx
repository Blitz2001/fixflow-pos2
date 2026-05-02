import { Receipt, Plus } from 'lucide-react'
import Link from 'next/link'

export default function ExpensesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Rent, salary, utilities & more</p>
        </div>
        <Link href="/dashboard/expenses/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Record Expense
        </Link>
      </div>
      <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-3">
        <Receipt className="w-12 h-12 text-muted-foreground/30" />
        <p className="font-semibold text-foreground">Expense Ledger</p>
        <p className="text-sm text-muted-foreground">Phase 4 — Full expense tracking with receipt upload</p>
      </div>
    </div>
  )
}
