import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Package, AlertTriangle } from 'lucide-react'

export default async function InventoryPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('memberships')
    .select('shop_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) return null

  const { data: items } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('shop_id', membership.shop_id)
    .order('name', { ascending: true })

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Catalog</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage parts, categories, and serial numbers.</p>
        </div>
        <Link href="/dashboard/inventory/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New Item
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-foreground">Item Name</th>
                <th className="px-6 py-4 font-semibold text-foreground">Category</th>
                <th className="px-6 py-4 font-semibold text-foreground">SKU / Brand</th>
                <th className="px-6 py-4 font-semibold text-foreground">Price</th>
                <th className="px-6 py-4 font-semibold text-foreground">Stock Level</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items && items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground flex items-center gap-2">
                        <Package className="w-4 h-4 text-brand-500" />
                        {item.name}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.category}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-xs text-foreground bg-accent inline-block px-1.5 py-0.5 rounded">{item.sku || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.brand}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {item.sell_price} LKR
                    </td>
                    <td className="px-6 py-4">
                      {item.quantity === 0 ? (
                        <span className="inline-flex items-center gap-1 text-red-400 font-medium text-xs bg-red-400/10 px-2 py-1 rounded-md">
                          <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock
                        </span>
                      ) : (
                        <span className="font-medium text-foreground">{item.quantity} in stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/inventory/${item.id}`} className="text-brand-500 hover:text-brand-400 font-medium text-sm transition-colors">
                        Manage Serials &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No inventory items found. Add your first part to get started!
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
