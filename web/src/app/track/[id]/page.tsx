import { createServerClient } from '@/lib/supabase/server'
import { Ticket, Clock, CheckCircle2, AlertCircle, Wrench, Package, Truck, User } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function PublicTrackingPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: ticket, error } = await supabase
    .from('repair_tickets')
    .select(`
      id, ticket_number, status, priority, issue_description,
      intake_at, estimated_completion_date,
      device:devices(brand, model),
      shop:shops(name, phone, address)
    `)
    .eq('id', id)
    .single()

  if (error || !ticket) {
    notFound()
  }

  const steps = [
    { label: 'Intake', status: 'intake', icon: Ticket },
    { label: 'Diagnosis', status: 'diagnosing', icon: AlertCircle },
    { label: 'Repairing', status: 'repairing', icon: Wrench },
    { label: 'Ready', status: 'ready', icon: CheckCircle2 },
    { label: 'Delivered', status: 'delivered', icon: Truck },
  ]

  const currentStatusIndex = steps.findIndex(s => s.status === ticket.status)
  
  // Custom status for those not in the main path
  const isCancelled = ticket.status === 'cancelled'
  const isWaitingParts = ticket.status === 'waiting_parts'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Repair Tracking</h1>
          <p className="text-slate-500 dark:text-slate-400">Status for Ticket #{ticket.ticket_number}</p>
        </div>

        {/* Shop Info Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{ticket.shop?.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-slate-500">Device</p>
              <p className="font-medium">{ticket.device?.brand} {ticket.device?.model}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500">Intake Date</p>
              <p className="font-medium">{new Date(ticket.intake_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">Repair Progress</h3>
          
          {isCancelled ? (
            <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-600">Repair Cancelled</p>
                <p className="text-sm text-red-500">Please contact the shop for more details.</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800" />
              <div 
                className="absolute left-[19px] top-0 w-0.5 bg-brand-500 transition-all duration-1000" 
                style={{ height: `${(currentStatusIndex / (steps.length - 1)) * 100}%` }} 
              />

              <div className="space-y-10">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = index <= currentStatusIndex
                  const isCurrent = index === currentStatusIndex

                  return (
                    <div key={step.status} className="relative flex items-center gap-6">
                      <div className={`z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                        isActive 
                        ? 'bg-brand-500 border-brand-500 text-white' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`font-semibold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-brand-500 font-medium animate-pulse mt-0.5">
                            Current Stage
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {isWaitingParts && (
            <div className="mt-8 flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl">
              <Package className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-600">Waiting for Parts</p>
                <p className="text-sm text-amber-500">We've ordered the necessary components. This might take a little longer.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center space-y-4">
          <p className="text-sm text-slate-500">
            Need help? Call us at <span className="text-slate-900 dark:text-white font-medium">{ticket.shop?.phone}</span>
          </p>
          <div className="pt-8">
            <Link href="/" className="text-xs text-slate-400 hover:text-brand-500 transition-colors uppercase tracking-widest font-semibold">
              Powered by RepairOS
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
