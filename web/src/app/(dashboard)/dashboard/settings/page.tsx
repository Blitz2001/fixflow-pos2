import { Settings, Store, Users, Shield } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { TeamManagement } from '@/components/features/settings/TeamManagement'
import type { MemberWithProfile } from '@/types/database'

export default async function SettingsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch shop and membership info
  const { data: membership } = await supabase
    .from('memberships')
    .select('shop_id, role, shop:shops(*)')
    .eq('user_id', user.id)
    .single()

  if (!membership) return null

  // Fetch all team members for this shop
  const { data: members } = await supabase
    .from('memberships')
    .select('*, profile:profiles(*)')
    .eq('shop_id', membership.shop_id)

  const shop = membership.shop as any
  const typedMembers = (members ?? []) as MemberWithProfile[]

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your shop profile and team members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Store className="w-4 h-4" /> Shop Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
            <Users className="w-4 h-4" /> Team Management
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
            <Shield className="w-4 h-4" /> Security & Roles
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Shop Profile Form */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-6">Shop Profile</h3>
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5 ml-1">Shop Name</label>
                  <input type="text" defaultValue={shop.name} className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5 ml-1">Phone Number</label>
                  <input type="text" defaultValue={shop.phone} className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5 ml-1">Business Address</label>
                <textarea rows={3} defaultValue={shop.address} className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-none" />
              </div>
              <div className="flex justify-end pt-4">
                <button className="bg-foreground text-background font-bold px-8 py-2.5 rounded-xl text-sm hover:bg-foreground/90 transition-all">
                  Save Shop Details
                </button>
              </div>
            </div>
          </div>

          {/* Team Management Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <TeamManagement 
              shopId={membership.shop_id} 
              members={typedMembers} 
              currentUserId={user.id} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
