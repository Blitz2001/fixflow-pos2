import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DirectPOSForm } from '@/components/features/sales/DirectPOSForm'

export default async function DirectPOSPage() {
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
    <div className="max-w-7xl mx-auto animate-fade-in pb-12 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <Link href="/dashboard/sales" className="p-2 hover:bg-accent rounded-xl transition-colors text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Direct Sales POS</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Ring up walk-in customers instantly.</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DirectPOSForm shopId={membership.shop_id} />
      </div>
    </div>
  )
}
