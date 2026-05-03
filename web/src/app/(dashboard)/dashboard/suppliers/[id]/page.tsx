import { createServerClient } from '@/lib/supabase/server'
import { SupplierLedger } from '@/components/features/suppliers/SupplierLedger'
import Link from 'next/link'
import { ArrowLeft, Building2, Phone, Mail, User } from 'lucide-react'

export default async function SupplierDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  
  const { data: supplier } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!supplier) return <div className="p-10 text-center">Supplier not found</div>

  return (
    <div className="animate-fade-in pb-12 px-6 pt-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard/suppliers" className="flex items-center gap-2 text-muted-foreground hover:text-brand-500 transition-colors mb-6 text-sm font-bold group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Suppliers
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-brand-500/10 text-brand-500 flex items-center justify-center shadow-inner">
              <Building2 className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">{supplier.name}</h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                  <User className="w-4 h-4 text-brand-500" />
                  {supplier.contact_person}
                </div>
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                    <Phone className="w-4 h-4 text-brand-500" />
                    {supplier.phone}
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                    <Mail className="w-4 h-4 text-brand-500" />
                    {supplier.email}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SupplierLedger supplierId={supplier.id} />
    </div>
  )
}
