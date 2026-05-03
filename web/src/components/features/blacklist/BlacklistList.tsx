'use client'

import { useState } from 'react'
import { Search, Plus, ShieldAlert, X, Loader2, Trash2 } from 'lucide-react'
import { createBlacklist, deleteBlacklist } from '@/lib/actions/blacklist'
import { toast } from 'sonner'

export function BlacklistList({ initialBlacklists, shopId }: { initialBlacklists: any[], shopId: string }) {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filtered = initialBlacklists.filter(b => 
    b.identifier.toLowerCase().includes(search.toLowerCase()) || 
    (b.reason && b.reason.toLowerCase().includes(search.toLowerCase()))
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      await createBlacklist(shopId, {
        entity_type: formData.get('entity_type') as string,
        identifier: formData.get('identifier') as string,
        reason: formData.get('reason') as string,
      })
      toast.success('Added to blacklist')
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
            placeholder="Search blacklist..." 
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Add to Blacklist
        </button>
      </div>

      <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px]">Type</th>
              <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px]">Identifier</th>
              <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px]">Reason</th>
              <th className="px-8 py-5 font-black text-foreground uppercase tracking-widest text-[10px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-8 py-5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-rose-500/10 text-rose-600 border-rose-500/20">
                    {item.entity_type}
                  </span>
                </td>
                <td className="px-8 py-5 font-bold text-foreground">{item.identifier}</td>
                <td className="px-8 py-5 text-muted-foreground">{item.reason || '-'}</td>
                <td className="px-8 py-5 text-right">
                  <button 
                    onClick={async () => {
                      if (confirm('Remove from blacklist?')) {
                        await deleteBlacklist(item.id)
                        toast.success('Removed from blacklist')
                      }
                    }}
                    className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <ShieldAlert className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-xl font-black text-muted-foreground uppercase tracking-tight">No blacklist entries.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-border flex items-center justify-between bg-rose-500/5">
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Add to Blacklist</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Block Customer, Supplier, or Item</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-muted rounded-2xl transition-colors">
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 ml-1">Entity Type</label>
                <select name="entity_type" required className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold appearance-none cursor-pointer">
                  <option value="customer">Customer (Name/Phone)</option>
                  <option value="supplier">Supplier</option>
                  <option value="item">Inventory Item (Name/SKU)</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 ml-1">Identifier (Name, Phone, SKU)</label>
                <input name="identifier" type="text" required placeholder="e.g. 0771234567 or Bad Customer Name" className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 ml-1">Reason</label>
                <input name="reason" type="text" placeholder="e.g. Didn't pay last time" className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold" />
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
                  className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Blacklist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
