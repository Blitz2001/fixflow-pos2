import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewItemForm } from '@/components/features/inventory/NewItemForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewInventoryItemPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('shop_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/onboarding')

  return (
    <div className="pb-12">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/inventory" className="p-2 hover:bg-accent rounded-xl transition-colors text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add Catalog Item</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Define a new part type before adding stock serial numbers.</p>
        </div>
      </div>

      <NewItemForm shopId={membership.shop_id} />
    </div>
  )
}
