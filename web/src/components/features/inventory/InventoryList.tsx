'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Package, AlertTriangle, Search } from 'lucide-react'

export function InventoryList({ initialItems }: { initialItems: any[] }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = initialItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="relative group max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-brand-500 transition-colors" />
        <input 
          type="text"
          placeholder="Search items by name, SKU, or brand..."
          className="w-full pl-12 pr-4 py-3.5 bg-card border border-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-black text-foreground uppercase tracking-widest text-[10px]">Item Name</th>
                <th className="px-6 py-4 font-black text-foreground uppercase tracking-widest text-[10px]">Category</th>
                <th className="px-6 py-4 font-black text-foreground uppercase tracking-widest text-[10px]">SKU / Brand</th>
                <th className="px-6 py-4 font-black text-foreground uppercase tracking-widest text-[10px]">Price</th>
                <th className="px-6 py-4 font-black text-foreground uppercase tracking-widest text-[10px]">Stock Level</th>
                <th className="px-6 py-4 font-black text-foreground uppercase tracking-widest text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-bold text-foreground flex items-center gap-2">
                        <Package className="w-4 h-4 text-brand-500" />
                        {item.name}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-muted px-2.5 py-1 rounded-lg text-xs font-semibold text-muted-foreground">
                        {item.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-mono text-xs text-foreground bg-accent inline-block px-1.5 py-0.5 rounded">{item.sku || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.brand}</p>
                    </td>
                    <td className="px-6 py-5 font-bold text-foreground">
                      {item.sell_price} LKR
                    </td>
                    <td className="px-6 py-5">
                      {item.quantity === 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-rose-500 font-bold text-[10px] uppercase tracking-widest bg-rose-500/10 px-2.5 py-1 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Out of Stock
                        </span>
                      ) : (
                        <span className={`font-bold text-[11px] uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          item.quantity < 5 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                        }`}>
                          {item.quantity} in stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link href={`/dashboard/inventory/${item.id}`} className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-400 font-black text-[10px] uppercase tracking-widest transition-all hover:gap-3">
                        Manage Serials &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                    {searchQuery ? `No items found matching "${searchQuery}"` : "No inventory items found."}
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
