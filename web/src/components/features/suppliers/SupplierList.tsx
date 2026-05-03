'use client'

import { useState } from 'react'
import { Search, Plus, Phone, Mail, User, X, Loader2, Building2, Wallet, ArrowUpCircle, ArrowDownCircle, Landmark } from 'lucide-react'
import Link from 'next/link'
import { createSupplier } from '@/lib/actions/suppliers'
import { toast } from 'sonner'
import type { SupplierRow } from '@/types/database'

interface SupplierListProps {
  initialSuppliers: SupplierRow[]
  shopId: string
}

export function SupplierList({ initialSuppliers, shopId }: SupplierListProps) {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredSuppliers = initialSuppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.phone && s.phone.includes(search)) ||
    (s.contact_person && s.contact_person.toLowerCase().includes(search.toLowerCase()))
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      await createSupplier(shopId, {
        name: formData.get('name') as string,
        contact_person: formData.get('contact_person') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        description: formData.get('description') as string,
      })
      toast.success('Supplier added successfully')
      setIsModalOpen(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers by name or contact..." 
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" /> New Supplier
        </button>
      </div>

      {/* Financial Overview Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <ArrowUpCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest opacity-70">Total Given (Paid)</p>
            <p className="text-2xl font-black text-emerald-700 tracking-tight">0.00 LKR</p>
          </div>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest opacity-70">Total Payable (Owed)</p>
            <p className="text-2xl font-black text-rose-700 tracking-tight">0.00 LKR</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="bg-card border border-border rounded-3xl p-6 hover:shadow-xl hover:border-brand-300 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6 flex-1 min-w-0">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
                <Building2 className="w-8 h-8" />
              </div>
              
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-black text-foreground mb-2 tracking-tight truncate">{supplier.name}</h3>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2.5 text-sm font-bold text-muted-foreground">
                    <User className="w-4 h-4 text-brand-500" />
                    {supplier.contact_person || 'No Contact Person'}
                  </div>
                  {supplier.phone && (
                    <div className="flex items-center gap-2.5 text-sm font-bold text-muted-foreground">
                      <Phone className="w-4 h-4 text-brand-500" />
                      {supplier.phone}
                    </div>
                  )}
                  {/* Financial Quick Status */}
                  <div className="flex items-center gap-4 border-l border-border pl-6 ml-2">
                    <div className="flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">0.00</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">0.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
              <Link 
                href={`/dashboard/suppliers/${supplier.id}`} 
                className="w-full md:w-auto px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-brand-500/20 transition-all active:scale-95 text-center"
              >
                Financial Ledger &rarr;
              </Link>
            </div>
          </div>
        ))}
        {filteredSuppliers.length === 0 && (
          <div className="py-24 text-center bg-card border border-border border-dashed rounded-3xl">
            <Building2 className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-xl font-black text-muted-foreground uppercase tracking-tight">No suppliers found.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Start by adding your first parts supplier.</p>
          </div>
        )}
      </div>

      {/* New Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-border flex items-center justify-between bg-muted/30">
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Add Supplier</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Parts & Inventory Partner</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-muted rounded-2xl transition-colors">
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 ml-1">Company Name</label>
                <input name="name" type="text" required placeholder="e.g. Apex Tech Solutions" className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 ml-1">Contact Person</label>
                  <input name="contact_person" type="text" placeholder="John Smith" className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 ml-1">Phone Number</label>
                  <input name="phone" type="tel" placeholder="077 123 4567" className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
                <input name="email" type="email" placeholder="sales@apextech.com" className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 ml-1">Description / Notes</label>
                <textarea name="description" placeholder="Supplier terms, delivery days, or any other notes..." rows={3} className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold resize-none" />
              </div>
              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-muted hover:bg-muted/80 text-foreground font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-brand-500 hover:bg-brand-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
