import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SupportChat from '@/components/features/support/SupportChat'
import { MessageSquare, HelpCircle, BookOpen, Sparkles } from 'lucide-react'

export default async function CustomerSupportPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Get active shop membership
  const { data: membership } = await supabase
    .from('memberships')
    .select('shop_id, role, shop:shops(name)')
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">No Active Membership</h3>
        <p className="text-sm text-slate-500 mt-2">You must belong to an active shop to contact support.</p>
      </div>
    )
  }

  const shopId = membership.shop_id
  const shopName = (membership.shop as any)?.name || 'Unknown Store'

  return (
    <div className="space-y-10 animate-fade-in pb-20 pt-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-2">
            Platform Support Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">Get real-time answers, troubleshoot issues, and contact RepairOS Core operations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Chat Portal - 2 Columns */}
        <div className="lg:col-span-2">
          <SupportChat shopId={shopId} shopName={shopName} />
        </div>

        {/* Helpful Resources Sidebar - 1 Column */}
        <div className="space-y-6">
          {/* Quick FAQ Card */}
          <div className="bg-slate-50/50 border border-slate-200/60 rounded-[2.5rem] p-8 shadow-md backdrop-blur-md">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" /> Platform Knowledge Base
            </h3>
            
            <div className="space-y-6">
              {[
                { q: "How are my billing charges calculated?", a: "RepairOS operates on a single flat-rate plan of LKR 2,500 per month. There are no hidden setup fees or extra user surcharges." },
                { q: "What happens if my shop gets suspended?", a: "Suspended shops are placed on 'Overdue status'. Your store features are temporarily locked, but your database records remain 100% safe." },
                { q: "How can I invite more technicians?", a: "Navigate to Dashboard → Settings → Team Members, enter their email address, select their permissions role, and click invite." }
              ].map((faq, i) => (
                <div key={i} className="space-y-2 border-b border-slate-200/40 last:border-0 pb-4 last:pb-0">
                  <p className="text-sm font-black text-slate-800 flex items-start gap-1.5 leading-snug">
                    <HelpCircle className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" /> {faq.q}
                  </p>
                  <p className="text-xs text-slate-500 pl-5 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats / Warning */}
          <div className="bg-emerald-500/[0.04] border border-emerald-500/10 rounded-[2rem] p-6 backdrop-blur-md">
            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-2">Platform SLA Status</h4>
            <p className="text-xl font-black text-emerald-600">99.98% Uptime</p>
            <p className="text-xs text-emerald-600/70 mt-1">Our support staff is globally active 24/7. Average ticket reply latency is under 15 minutes.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
