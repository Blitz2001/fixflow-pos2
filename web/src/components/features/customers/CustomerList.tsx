'use client'

import { useState } from 'react'
import { Search, Plus, Phone, Mail, Calendar, User, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createCustomer } from '@/lib/actions/customers'
import { toast } from 'sonner'
import type { CustomerRow } from '@/types/database'

interface CustomerListProps {
  initialCustomers: CustomerRow[]
  shopId: string
}

export function CustomerList({ initialCustomers, shopId }: CustomerListProps) {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredCustomers = initialCustomers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone_number.includes(search) ||
    (c.email?.toLowerCase().includes(search.toLowerCase()))
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      await createCustomer(shopId, {
        name: formData.get('name') as string,
        phone_number: formData.get('phone_number') as string,
        email: formData.get('email') as string,
      })
      toast.success('Customer added successfully')
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name or phone..." 
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" /> New Customer
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-card border border-border rounded-3xl p-6 hover:shadow-xl hover:border-brand-300 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6 flex-1 min-w-0">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
                {customer.name[0]}
              </div>
              
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-black text-foreground mb-2 tracking-tight truncate">{customer.name}</h3>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2.5 text-sm font-bold text-muted-foreground">
                    <Phone className="w-4 h-4 text-brand-500" />
                    {customer.phone_number}
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2.5 text-sm font-bold text-muted-foreground">
                      <Mail className="w-4 h-4 text-brand-500" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-[11px] font-black text-muted-foreground/50 uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {new Date(customer.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
              <Link 
                href={`/dashboard/customers/${customer.id}`} 
                className="w-full md:w-auto px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-brand-500/20 transition-all active:scale-95 text-center"
              >
                View History &rarr;
              </Link>
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && (
          <div className="py-24 text-center bg-card border border-border border-dashed rounded-3xl">
            <User className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-xl font-black text-muted-foreground uppercase tracking-tight">No customers found.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Try searching for a different name or number.</p>
          </div>
        )}
      </div>

      {/* New Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Add New Customer</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5 ml-1">Full Name</label>
                <input name="name" type="text" required placeholder="John Doe" className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5 ml-1">Phone Number</label>
                <input name="phone_number" type="tel" required placeholder="077 123 4567" className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5 ml-1">Email Address (Optional)</label>
                <input name="email" type="email" placeholder="john@example.com" className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
