'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createInventoryItem } from '@/lib/actions/inventory'
import { Loader2, Package, Tag, DollarSign, CheckCircle2 } from 'lucide-react'

const itemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  base_cost: z.number().min(0),
  selling_price: z.number().min(0),
  sku: z.string().optional(),
})

type ItemFormValues = z.infer<typeof itemSchema>

export function NewItemForm({ shopId }: { shopId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { base_cost: 0, selling_price: 0 }
  })

  const onSubmit = async (data: ItemFormValues) => {
    setLoading(true)
    try {
      const item = await createInventoryItem({ ...data, shop_id: shopId })
      toast.success('Inventory item created!')
      router.push(`/dashboard/inventory/${item.id}`)
    } catch (e: any) {
      toast.error(e.message || 'Failed to create item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl animate-fade-in">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        
        <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground mb-4">
          <Package className="w-5 h-5 text-brand-500" /> Basic Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Item Name *</label>
            <input {...register('name')} placeholder="e.g. 500GB NVMe SSD" className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500" />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Brand</label>
            <input {...register('brand')} placeholder="e.g. Samsung" className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Category *</label>
            <select {...register('category')} className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500">
              <option value="">Select...</option>
              <option value="Storage">Storage (SSD/HDD)</option>
              <option value="Memory">Memory (RAM)</option>
              <option value="Screen">Screen/Display</option>
              <option value="Battery">Battery</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && <p className="text-xs text-red-400 mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> SKU / Barcode
            </label>
            <input {...register('sku')} className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500 font-mono text-sm" />
          </div>
        </div>

        <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground mt-8 mb-4 border-t border-border pt-6">
          <DollarSign className="w-5 h-5 text-brand-500" /> Pricing (LKR)
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Base Cost</label>
            <input {...register('base_cost', { valueAsNumber: true })} type="number" step="0.01" className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Selling Price *</label>
            <input {...register('selling_price', { valueAsNumber: true })} type="number" step="0.01" className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500" />
            {errors.selling_price && <p className="text-xs text-red-400 mt-1">{errors.selling_price.message}</p>}
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><CheckCircle2 className="w-5 h-5" /> Create Item Catalog Entry</>}
      </button>
    </form>
  )
}
