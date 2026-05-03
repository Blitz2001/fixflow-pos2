import { createServerClient } from '@/lib/supabase/server'
import { CustomerList } from '@/components/features/customers/CustomerList'

export default async function CustomersPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('memberships')
    .select('shop_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) return null

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('shop_id', membership.shop_id)
    .order('name', { ascending: true })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your customer database</p>
      </div>

      <CustomerList 
        initialCustomers={customers ?? []} 
        shopId={membership.shop_id} 
      />
    </div>
  )
}
