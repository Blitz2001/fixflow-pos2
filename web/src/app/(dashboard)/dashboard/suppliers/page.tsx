import { createServerClient } from '@/lib/supabase/server'
import { SupplierList } from '@/components/features/suppliers/SupplierList'

export default async function SuppliersPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('memberships')
    .select('shop_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) return null

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .eq('shop_id', membership.shop_id)
    .order('name', { ascending: true })

  return (
    <div className="space-y-6 animate-fade-in pb-12 px-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Suppliers & Ledgers</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Manage parts providers and financial settlements.</p>
        </div>
      </div>

      <SupplierList initialSuppliers={suppliers || []} shopId={membership.shop_id} />
    </div>
  )
}
