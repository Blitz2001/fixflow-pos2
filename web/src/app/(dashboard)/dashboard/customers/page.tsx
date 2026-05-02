import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Phone, Mail, HardDrive, Plus } from 'lucide-react'

export default async function CustomersPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('shop_id')
    .eq('user_id', user.id)
    .single()
  if (!membership) redirect('/onboarding')

  // Fetch all customers along with their devices and tickets count
  const { data: customers } = await supabase
    .from('customers')
    .select(`
      id,
      name,
      phone_number,
      email,
      created_at,
      devices ( id, model ),
      repair_tickets ( id )
    `)
    .eq('shop_id', membership.shop_id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your client database and their devices.</p>
        </div>
        <Link href="/dashboard/tickets/new" className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Customer (via Ticket)
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-foreground">Customer</th>
                <th className="px-6 py-4 font-semibold text-foreground">Contact</th>
                <th className="px-6 py-4 font-semibold text-foreground">Devices</th>
                <th className="px-6 py-4 font-semibold text-foreground">Repair History</th>
                <th className="px-6 py-4 font-semibold text-foreground">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers && customers.length > 0 ? (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-xs">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-foreground">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" /> <span>{c.phone_number}</span>
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-3.5 h-3.5" /> <span>{c.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {c.devices && c.devices.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {c.devices.map((d: any) => (
                            <span key={d.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent border border-border text-xs rounded-md text-muted-foreground">
                              <HardDrive className="w-3 h-3" /> {d.model}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-foreground">{c.repair_tickets?.length || 0} Tickets</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No customers yet.</p>
                    <p className="text-xs mt-1">Customers are automatically added when you create a repair ticket.</p>
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
