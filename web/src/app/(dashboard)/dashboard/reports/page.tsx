import { BarChart3 } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm mt-0.5">P&L dashboard, revenue charts & predictions</p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-3">
        <BarChart3 className="w-12 h-12 text-muted-foreground/30" />
        <p className="font-semibold text-foreground">Business Intelligence Dashboard</p>
        <p className="text-sm text-muted-foreground">Phase 4 & 5 — Profit calculator, tax engine & forecasting</p>
      </div>
    </div>
  )
}
