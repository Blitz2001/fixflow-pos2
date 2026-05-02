import { createServerClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { AddSerialsModal } from '@/components/features/inventory/AddSerialsModal'

interface InventoryDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function InventoryDetailPage({ params }: InventoryDetailPageProps) {
  const { id } = await params
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('shop_id')
    .eq('user_id', user.id)
    .single()
  if (!membership) redirect('/onboarding')

  // Fetch the item
  const { data: item, error: itemError } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('id', id)
    .eq('shop_id', membership.shop_id)
    .single()

  if (itemError || !item) notFound()

  // Fetch all serial numbers for this item
  const { data: serials } = await supabase
    .from('serial_numbers')
    .select(`
      *,
      ticket:repair_tickets (ticket_number)
    `)
    .eq('item_id', item.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/inventory" className="p-2 hover:bg-accent rounded-xl transition-colors text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Package className="w-6 h-6 text-brand-500" /> {item.name}
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold border border-border bg-accent text-muted-foreground">
              {item.category}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex gap-4">
            <span>SKU: {item.sku || 'N/A'}</span>
            <span>Brand: {item.brand || 'N/A'}</span>
            <span>Stock: <strong className="text-foreground">{item.quantity}</strong></span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Serials List */}
        <div className="md:col-span-2">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border bg-accent/30">
              <h2 className="font-semibold text-foreground">Tracked Serial Numbers</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-accent/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-foreground">Serial Number</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Assigned Ticket</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Added On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {serials && serials.length > 0 ? (
                    serials.map((sn) => (
                      <tr key={sn.id} className="hover:bg-accent/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{sn.serial_number}</td>
                        <td className="px-4 py-3">
                          {sn.status === 'Available' && <span className="inline-flex items-center gap-1 text-green-400 font-medium text-xs bg-green-400/10 px-2 py-1 rounded-md"><CheckCircle2 className="w-3.5 h-3.5" /> Available</span>}
                          {sn.status === 'Sold' && <span className="inline-flex items-center gap-1 text-brand-500 font-medium text-xs bg-brand-500/10 px-2 py-1 rounded-md"><CheckCircle2 className="w-3.5 h-3.5" /> Sold</span>}
                          {sn.status === 'Defective' && <span className="inline-flex items-center gap-1 text-red-400 font-medium text-xs bg-red-400/10 px-2 py-1 rounded-md"><XCircle className="w-3.5 h-3.5" /> Defective</span>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {sn.ticket ? (
                            <Link href={`/dashboard/tickets/${sn.ticket_id}`} className="hover:underline text-brand-500">
                              {sn.ticket.ticket_number}
                            </Link>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(sn.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        No serial numbers tracked yet. Add some stock!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div>
          <AddSerialsModal itemId={item.id} shopId={membership.shop_id} />

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 text-foreground">Financials</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-sm text-muted-foreground">Base Cost</span>
                <span className="font-medium text-foreground">{item.cost_price} LKR</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-sm text-muted-foreground">Selling Price</span>
                <span className="font-medium text-brand-500">{item.sell_price} LKR</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Profit Margin</span>
                <span className="font-medium text-green-400">
                  {item.sell_price > 0 
                    ? Math.round(((item.sell_price - item.cost_price) / item.sell_price) * 100) 
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
