'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { assignPartToTicket } from '@/lib/actions/inventory'
import { toast } from 'sonner'
import { Plus, Package, Loader2 } from 'lucide-react'

export function AssignPartSection({ ticketId, shopId, currentAssignedSerials }: { ticketId: string, shopId: string, currentAssignedSerials: any[] }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [selectedItemId, setSelectedItemId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [availableSerials, setAvailableSerials] = useState<any[]>([])
  const [selectedSerialId, setSelectedSerialId] = useState('')

  useEffect(() => {
    supabase
      .from('inventory_items')
      .select('id, name, quantity')
      .eq('shop_id', shopId)
      .gt('quantity', 0)
      .then(({ data }) => setItems(data || []))
  }, [shopId, supabase])

  useEffect(() => {
    if (!selectedItemId) {
      setAvailableSerials([])
      return
    }
    supabase
      .from('serial_numbers')
      .select('id, serial_number')
      .eq('item_id', selectedItemId)
      .eq('status', 'Available')
      .then(({ data }) => setAvailableSerials(data || []))
  }, [selectedItemId, supabase])

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAssign = async () => {
    if (!selectedSerialId) return
    setLoading(true)
    try {
      await assignPartToTicket(ticketId, selectedSerialId, shopId)
      toast.success('Part successfully assigned!')
      setSelectedItemId('')
      setSelectedSerialId('')
      setSearchQuery('')
    } catch (e: any) {
      toast.error(e.message || 'Failed to assign part')
    } finally {
      setLoading(false)
    }
  }

  const selectedItem = items.find(i => i.id === selectedItemId)

  return (
    <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm">
      <h2 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-brand-500" /> Inventory Parts
      </h2>

      {/* List assigned parts */}
      <div className="space-y-3 mb-5">
        {currentAssignedSerials.length > 0 ? (
          currentAssignedSerials.map((sn) => (
            <div key={sn.id} className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border/50">
              <div>
                <p className="font-bold text-foreground text-sm">{sn.item?.name}</p>
                <p className="font-mono text-xs text-muted-foreground">SN: {sn.serial_number}</p>
              </div>
              <span className="font-bold text-brand-500 text-sm">+{sn.item?.sell_price}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground italic text-center py-4">No parts assigned.</p>
        )}
      </div>

      {/* Add new part form */}
      <div className="space-y-3 pt-5 border-t border-border border-dashed relative">
        <div className="grid gap-3">
          <div className="relative">
            <input 
              type="text"
              placeholder="Search item name (e.g. iPhone Screen)"
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
              value={selectedItem ? selectedItem.name : searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (selectedItemId) {
                  setSelectedItemId('')
                  setSelectedSerialId('')
                }
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
            />
            
            {showResults && searchQuery && !selectedItemId && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-card border border-border rounded-2xl shadow-2xl z-30 max-h-48 overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-200">
                {filteredItems.length > 0 ? (
                  filteredItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedItemId(item.id)
                        setShowResults(false)
                        setSearchQuery('')
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                    >
                      <span className="text-sm font-bold text-foreground">{item.name}</span>
                      <span className="text-[10px] bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                        {item.quantity} In Stock
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground italic">No matches found.</div>
                )}
              </div>
            )}
          </div>

          {availableSerials.length > 0 && (
            <div className="animate-in slide-in-from-top-2">
              <select 
                className="w-full px-3 py-3 bg-muted/50 border border-border rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer"
                value={selectedSerialId}
                onChange={(e) => setSelectedSerialId(e.target.value)}
              >
                <option value="">-- Select Serial Number --</option>
                {availableSerials.map(sn => (
                  <option key={sn.id} value={sn.id}>{sn.serial_number}</option>
                ))}
              </select>
            </div>
          )}

          <button 
            onClick={handleAssign}
            disabled={!selectedSerialId || loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Assign to Repair
          </button>
        </div>
      </div>
    </div>
  )
}
