'use client'

import { useState } from 'react'
import { Banknote, Landmark, Wallet, FileText, X } from 'lucide-react'

type Supplier = { id: string, name: string }

export function PaymentActionCards({ suppliers = [] }: { suppliers: Supplier[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [entryType, setEntryType] = useState<'PAYMENT' | 'PURCHASE'>('PAYMENT')
  const [method, setMethod] = useState<'CASH' | 'CHEQUE' | 'CREDIT'>('CASH')

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Money Given Action Section */}
        <div className="bg-card border border-border rounded-[28px] p-6 shadow-sm group hover:shadow-xl hover:border-emerald-500/20 transition-all">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-foreground tracking-tight">Register Money Given</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Record supplier payments</p>
              </div>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Section A</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
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

        {/* Money Received Action Section */}
        <div className="bg-card border border-border rounded-[28px] p-6 shadow-sm group hover:shadow-xl hover:border-amber-500/20 transition-all">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-foreground tracking-tight">Register Money Received</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Record bills or returns</p>
              </div>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Section B</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button 
              onClick={() => { setEntryType('PURCHASE'); setMethod('CASH'); setIsModalOpen(true); }}
              className="group relative flex items-center justify-center gap-2.5 p-4 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/30 rounded-2xl transition-all"
            >
              <Wallet className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Receive Cash</span>
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

      {/* Entry Modal */}
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
            <form className="p-8 space-y-6" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2.5 ml-1">Select Supplier</label>
                <select required defaultValue="" className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold appearance-none cursor-pointer">
                  <option value="" disabled>Choose a supplier...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                  {suppliers.length === 0 && <option value="mock">Apex Tech (Mock)</option>}
                  {suppliers.length === 0 && <option value="mock2">Global Parts (Mock)</option>}
                </select>
              </div>

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
                  <input type="text" placeholder="e.g. 11223344" required className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-mono font-bold" />
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
                  type="submit"
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
    </>
  )
}
