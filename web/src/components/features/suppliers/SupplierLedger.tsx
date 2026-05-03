'use client'

import { useState } from 'react'
import { Plus, ArrowUpCircle, ArrowDownCircle, Banknote, Landmark, FileText, X, Loader2, Calendar } from 'lucide-react'
import { toast } from 'sonner'

export function SupplierLedger({ supplierId }: { supplierId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'GIVEN' | 'RECEIVED'>('ALL')
  const [entries, setEntries] = useState<any[]>([
    // Mock data for initial UI
    { id: '1', date: '2026-05-01', type: 'PAYMENT', method: 'CHEQUE', amount: 50000, reference: 'CHQ-8822', note: 'Advance for screens' },
    { id: '2', date: '2026-05-02', type: 'PURCHASE', method: 'CREDIT', amount: 75000, reference: 'INV-990', note: 'iPhone 13 Parts' },
  ])

  const totals = entries.reduce((acc, curr) => {
    if (curr.type === 'PAYMENT') acc.given += curr.amount
    else acc.received += curr.amount
    return acc
  }, { given: 0, received: 0 })

  const balance = totals.received - totals.given

  return (
    <div className="space-y-8">
      {/* Financial Summary - Big & Bold */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[32px] shadow-sm">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ArrowUpCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Total Given (Paid)</span>
          </div>
          <p className="text-3xl font-black text-emerald-700 tracking-tight">{totals.given.toLocaleString()} LKR</p>
        </div>
        
        <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-[32px] shadow-sm">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <ArrowDownCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Total Received (Bills)</span>
          </div>
          <p className="text-3xl font-black text-amber-700 tracking-tight">{totals.received.toLocaleString()} LKR</p>
        </div>

        <div className={`p-8 rounded-[32px] border shadow-sm ${balance > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-brand-500/10 border-brand-500/20'}`}>
          <div className="flex items-center gap-4 mb-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${balance > 0 ? 'bg-rose-500 shadow-rose-500/20' : 'bg-brand-500 shadow-brand-500/20'}`}>
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-current uppercase tracking-widest opacity-70">Outstanding Balance</span>
          </div>
          <p className="text-3xl font-black tracking-tight">{Math.abs(balance).toLocaleString()} LKR</p>
          <p className="text-[10px] font-black uppercase mt-1 opacity-60 tracking-wider">
            {balance > 0 ? 'PAYABLE TO SUPPLIER' : 'CREDIT IN ACCOUNT'}
          </p>
        </div>
      </div>

      {/* SEPARATE ACTION SECTIONS: GIVEN vs RECEIVED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION: MONEY GIVEN (PAYMENTS) */}
        <div className="bg-white dark:bg-card border border-border rounded-[28px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-foreground tracking-tight">Money Given</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Record supplier payments</p>
            </div>
            <Banknote className="w-6 h-6 text-emerald-500 opacity-20" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => { setEntryType('PAYMENT'); setMethod('CASH'); setIsModalOpen(true); }}
              className="group relative flex items-center justify-center gap-2.5 p-4 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/30 rounded-2xl transition-all"
            >
              <Banknote className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Give Cash</span>
            </button>
            <button 
              onClick={() => { setEntryType('PAYMENT'); setMethod('CHEQUE'); setIsModalOpen(true); }}
              className="group relative flex items-center justify-center gap-2.5 p-4 bg-brand-500/5 hover:bg-brand-500/10 border border-brand-500/10 hover:border-brand-500/30 rounded-2xl transition-all"
            >
              <Landmark className="w-4 h-4 text-brand-600 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black text-brand-700 uppercase tracking-widest">Give Cheque</span>
            </button>
          </div>
        </div>

        {/* SECTION: MONEY RECEIVED (PURCHASES/BILLS) */}
        <div className="bg-white dark:bg-card border border-border rounded-[28px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-foreground tracking-tight">Money Received</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Record bills or returns</p>
            </div>
            <FileText className="w-6 h-6 text-amber-500 opacity-20" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => { setEntryType('PURCHASE'); setMethod('CREDIT'); setIsModalOpen(true); }}
              className="group relative flex items-center justify-center gap-2.5 p-4 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/30 rounded-2xl transition-all"
            >
              <FileText className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Receive Bill</span>
            </button>
            <button 
              onClick={() => { setEntryType('PURCHASE'); setMethod('CHEQUE'); setIsModalOpen(true); }}
              className="group relative flex items-center justify-center gap-2.5 p-4 bg-brand-500/5 hover:bg-brand-500/10 border border-brand-500/10 hover:border-brand-500/30 rounded-2xl transition-all"
            >
              <Landmark className="w-4 h-4 text-brand-600 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black text-brand-700 uppercase tracking-widest">Recv Cheque</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Table Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div>
            <h2 className="text-sm font-black text-foreground uppercase tracking-[0.2em] mb-1">Master Payment Ledger</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Complete bidirectional transaction log</p>
          </div>
          
          <div className="flex bg-muted/50 p-1.5 rounded-[20px] border border-border/50">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-5 py-2 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'ALL' ? 'bg-white dark:bg-card text-brand-500 shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
            >
              All History
            </button>
            <button 
              onClick={() => setFilter('GIVEN')}
              className={`px-5 py-2 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'GIVEN' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-muted-foreground hover:text-emerald-500'}`}
            >
              Given Only
            </button>
            <button 
              onClick={() => setFilter('RECEIVED')}
              className={`px-5 py-2 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'RECEIVED' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-muted-foreground hover:text-amber-500'}`}
            >
              Received Only
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-card border border-border rounded-[32px] overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px]">Date</th>
                <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px]">Category</th>
                <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px]">Method</th>
                <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px]">Reference / Cheque</th>
                <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px]">Amount</th>
                <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px] text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries
                .filter(entry => {
                  if (filter === 'ALL') return true
                  if (filter === 'GIVEN') return entry.type === 'PAYMENT'
                  if (filter === 'RECEIVED') return entry.type === 'PURCHASE'
                  return true
                })
                .map((entry, idx) => (
                <tr key={entry.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-8 py-5 font-bold text-muted-foreground">{entry.date}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      entry.type === 'PAYMENT' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>
                      {entry.type === 'PAYMENT' ? 'GIVEN' : 'RECEIVED'}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-bold text-foreground">
                    <div className="flex items-center gap-2.5">
                      {entry.method === 'CHEQUE' ? <Landmark className="w-4 h-4 text-brand-500" /> : <Banknote className="w-4 h-4 text-brand-500" />}
                      {entry.method}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {entry.reference ? (
                      <span className="font-mono text-xs text-foreground bg-accent/50 px-2 py-1 rounded-lg">
                        {entry.reference}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40 italic text-xs">No reference</span>
                    )}
                  </td>
                  <td className={`px-8 py-5 font-black text-base ${entry.type === 'PAYMENT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {entry.type === 'PAYMENT' ? '-' : '+'}{entry.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-right font-black text-foreground text-base">
                    {entries.slice(0, idx + 1).reduce((acc, e) => acc + (e.type === 'PURCHASE' ? e.amount : -e.amount), 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal - Unified but dynamically styled */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-8 border-b border-border flex items-center justify-between ${entryType === 'PAYMENT' ? 'bg-emerald-500/5' : 'bg-amber-500/5'}`}>
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">
                  {entryType === 'PAYMENT' ? 'Money Given' : 'Money Received'}
                </h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                  {method} Record Entry
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-muted rounded-2xl transition-colors">
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>
            <form className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2.5 ml-1">Amount (LKR)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-muted-foreground/40">LKR</span>
                  <input type="number" required placeholder="0.00" className="w-full pl-16 pr-5 py-5 bg-muted/50 border border-border rounded-3xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-black text-2xl text-foreground" />
                </div>
              </div>

              {method === 'CHEQUE' && (
                <div className="animate-in slide-in-from-top-4">
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2.5 ml-1">Cheque Number</label>
                  <input type="text" placeholder="e.g. 11223344" className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-mono font-bold" />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2.5 ml-1">Reference / Note</label>
                <input type="text" placeholder={entryType === 'PAYMENT' ? 'Payment reference' : 'Bill or Invoice number'} className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold" />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-muted hover:bg-muted/80 text-foreground font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className={`flex-1 py-4 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg transition-all ${
                    entryType === 'PAYMENT' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                  }`}
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Wallet({ className }: { className?: string }) {
  return <Banknote className={className} />
}
