import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { InventoryList } from '@/components/features/inventory/InventoryList'

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
          <h1 className="text-2xl font-black text-foreground tracking-tight">Inventory Catalog</h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5">Manage parts, categories, and serial numbers.</p>
        </div>
        <Link href="/dashboard/inventory/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-500/20 active:scale-95">
          <Plus className="w-4 h-4" /> New Item
        </Link>
      </div>

      <InventoryList initialItems={items || []} />
    </div>
  )
}
