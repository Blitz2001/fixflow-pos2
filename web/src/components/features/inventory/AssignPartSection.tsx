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
  const [availableSerials, setAvailableSerials] = useState<any[]>([])
  const [selectedSerialId, setSelectedSerialId] = useState('')

  useEffect(() => {
    // Fetch all inventory items that have stock > 0
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
    // Fetch available serials for the selected item
    supabase
      .from('serial_numbers')
      .select('id, serial_number')
      .eq('item_id', selectedItemId)
      .eq('status', 'Available')
      .then(({ data }) => setAvailableSerials(data || []))
  }, [selectedItemId, supabase])

  const handleAssign = async () => {
    if (!selectedSerialId) return
    setLoading(true)
    try {
      await assignPartToTicket(ticketId, selectedSerialId, shopId)
      toast.success('Part successfully assigned to ticket!')
      setSelectedItemId('')
      setSelectedSerialId('')
      // Page will refresh automatically via Server Action revalidatePath
    } catch (e: any) {
      toast.error(e.message || 'Failed to assign part')
    } finally {
      setLoading(false)
    }
  }

  const totalPartsCost = currentAssignedSerials.reduce((acc, sn) => acc + (sn.item?.sell_price || 0), 0)

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-foreground border-b border-border pb-4">
        <Package className="w-5 h-5 text-brand-500" /> Assigned Parts
      </h2>

      {/* List assigned parts */}
      <div className="space-y-3 mb-6">
        {currentAssignedSerials.length > 0 ? (
          currentAssignedSerials.map((sn) => (
            <div key={sn.id} className="flex items-center justify-between bg-accent/30 p-3 rounded-xl border border-border/50">
              <div>
                <p className="font-medium text-foreground text-sm">{sn.item?.name}</p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">SN: {sn.serial_number}</p>
              </div>
              <span className="font-semibold text-brand-500 text-sm">+{sn.item?.sell_price} LKR</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground italic">No parts assigned to this repair yet.</p>
        )}
        
        {currentAssignedSerials.length > 0 && (
          <div className="flex justify-between items-center pt-3 border-t border-border mt-2">
            <span className="text-sm font-medium text-foreground">Total Parts Cost</span>
            <span className="font-bold text-foreground">{totalPartsCost} LKR</span>
          </div>
        )}
      </div>

      {/* Add new part form */}
      <div className="space-y-3 bg-background p-4 rounded-xl border border-border">
        <h3 className="text-sm font-medium text-foreground">Use a Part from Inventory</h3>
        
        <div className="grid gap-3">
          <select 
            className="w-full px-3 py-2 bg-accent/50 border border-border rounded-xl focus:ring-2 focus:ring-brand-500 text-sm"
            value={selectedItemId}
            onChange={(e) => {
              setSelectedItemId(e.target.value)
              setSelectedSerialId('')
            }}
          >
            <option value="">-- Select Item Type --</option>
            {items.map(i => (
              <option key={i.id} value={i.id}>{i.name} ({i.quantity} in stock)</option>
            ))}
          </select>

          {availableSerials.length > 0 && (
            <select 
              className="w-full px-3 py-2 bg-accent/50 border border-border rounded-xl focus:ring-2 focus:ring-brand-500 font-mono text-sm"
              value={selectedSerialId}
              onChange={(e) => setSelectedSerialId(e.target.value)}
            >
              <option value="">-- Select Serial Number --</option>
              {availableSerials.map(sn => (
                <option key={sn.id} value={sn.id}>{sn.serial_number}</option>
              ))}
            </select>
          )}

          <button 
            onClick={handleAssign}
            disabled={!selectedSerialId || loading}
            className="w-full py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm mt-1"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Assign to Ticket
          </button>
        </div>
      </div>

    </div>
  )
}
