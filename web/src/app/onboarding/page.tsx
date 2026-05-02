'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Wrench, Building2, Phone, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  name: z.string().min(2, 'Shop name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
})
type Form = z.infer<typeof schema>

/**
 * Onboarding wizard — shown once after signup when the user has no shop.
 * Creates a shop and an OWNER membership in one go.
 */
export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async ({ name, phone, address }: Form) => {
    setLoading(true)
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) throw new Error('Not authenticated')

      // 1. Create shop and owner membership atomically via RPC
      const { data: shopId, error: shopErr } = await supabase.rpc('create_shop_with_owner', {
        shop_name: name,
        shop_phone: phone || null,
        shop_address: address || null
      })
      if (shopErr) throw shopErr

      toast.success(`Welcome! "${name}" is ready.`)
      router.push('/dashboard')
      router.refresh()
    } catch (e: any) {
      console.error('Shop creation error:', e)
      toast.error(e?.message || e?.error_description || 'Failed to create shop. Check console.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 mb-4">
            <Wrench className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Set Up Your Shop</h1>
          <p className="mt-2 text-slate-400 text-sm">This takes 30 seconds. You can update details later.</p>
        </div>

        <div className="rounded-2xl p-8 bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="shop-name" className="block text-sm font-medium text-slate-300 mb-1.5">Shop Name *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="shop-name" type="text" placeholder="e.g. TechFix Colombo" {...register('name')}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition" />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="shop-phone" className="block text-sm font-medium text-slate-300 mb-1.5">Phone <span className="text-slate-500">(optional)</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="shop-phone" type="tel" placeholder="+94 77 123 4567" {...register('phone')}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition" />
              </div>
            </div>

            <div>
              <label htmlFor="shop-address" className="block text-sm font-medium text-slate-300 mb-1.5">Address <span className="text-slate-500">(optional)</span></label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <textarea id="shop-address" rows={2} placeholder="123 Main Street, Colombo 03" {...register('address')}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition resize-none" />
              </div>
            </div>

            <button id="btn-create-shop" type="submit" disabled={loading}
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating…</> : 'Create Shop & Continue →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
