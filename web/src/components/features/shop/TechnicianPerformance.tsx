import { createServerClient } from '@/lib/supabase/server'
import { User, CheckCircle2, Clock } from 'lucide-react'

export async function TechnicianPerformance({ shopId }: { shopId: string }) {
  const supabase = await createServerClient()

  // Fetch technicians and their completed tickets count
  const { data: techs, error } = await supabase
    .from('memberships')
    .select(`
      user_id,
      profile:profiles(full_name, avatar_url)
    `)
    .eq('shop_id', shopId)
    .eq('role', 'TECHNICIAN')

  if (error || !techs) return null

  // Fetch ticket counts per technician
  const { data: ticketStats } = await supabase
    .from('repair_tickets')
    .select('assigned_to, status')
    .eq('shop_id', shopId)
    .not('assigned_to', 'is', null)

  const performance = techs.map(t => {
    const assignedTickets = ticketStats?.filter(s => s.assigned_to === t.user_id) || []
    const completed = assignedTickets.filter(s => s.status === 'delivered' || s.status === 'ready').length
    const active = assignedTickets.filter(s => s.status !== 'delivered' && s.status !== 'cancelled').length
    
    return {
      name: (t.profile as any)?.full_name || 'Unknown',
      completed,
      active,
    }
  }).sort((a, b) => b.completed - a.completed)

  return (
    <div className="space-y-4">
      {performance.map((p, i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card/50">
          <div className="p-2 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {p.completed} Done
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3 text-amber-500" />
                {p.active} Active
              </span>
            </div>
          </div>
        </div>
      ))}
      {performance.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No technicians found.</p>
      )}
    </div>
  )
}
