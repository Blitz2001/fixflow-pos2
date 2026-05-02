'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'
import { createTicket } from '@/lib/actions/tickets'
import { Loader2, Camera, X, Smartphone, User, FileText, CheckCircle2 } from 'lucide-react'

// Schema matches our Server Action (CreateTicketInput)
const intakeSchema = z.object({
  customer_name: z.string().min(1, 'Name is required'),
  customer_phone: z.string().min(5, 'Phone is required'),
  customer_email: z.string().email('Invalid email').optional().or(z.literal('')),
  device_brand: z.string().optional(),
  device_model: z.string().min(1, 'Model is required'),
  device_serial: z.string().optional(),
  issue_description: z.string().min(3, 'Please describe the issue'),
  priority: z.enum(['low','normal','high','urgent']).default('normal'),
  estimated_cost: z.number().positive().optional(),
  estimated_completion_date: z.string().optional(),
  accessories_included: z.array(z.string()).default([]),
})

type IntakeFormValues = z.infer<typeof intakeSchema>

interface IntakeFormProps {
  shopId: string
}

export function IntakeForm({ shopId }: IntakeFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([])
  const [accInput, setAccInput] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues: { priority: 'normal', accessories_included: [] }
  })

  const accessories = watch('accessories_included')

  const handleAddAccessory = () => {
    if (accInput.trim() && !accessories.includes(accInput.trim())) {
      setValue('accessories_included', [...accessories, accInput.trim()])
      setAccInput('')
    }
  }

  const handleRemoveAccessory = (acc: string) => {
    setValue('accessories_included', accessories.filter(a => a !== acc))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    const files = Array.from(e.target.files)
    
    // Client-side compression before setting state
    const compressed = await Promise.all(
      files.map(async (file) => {
        if (!file.type.startsWith('image/')) return file
        return await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true })
      })
    )
    setEvidenceFiles(prev => [...prev, ...compressed].slice(0, 5)) // Max 5 photos
  }

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: IntakeFormValues) => {
    setLoading(true)
    try {
      // 1. Create the ticket and customer/device records
      const ticket = await createTicket({ ...data, shop_id: shopId })
      
      // 2. Upload Evidence Photos if any
      if (evidenceFiles.length > 0) {
        toast.loading('Uploading evidence photos...', { id: 'upload' })
        
        for (const file of evidenceFiles) {
          const ext = file.name.split('.').pop()
          const fileName = `${shopId}/${ticket.ticket_number}_${Date.now()}.${ext}`
          
          const { error: uploadErr } = await supabase.storage
            .from('device-evidence')
            .upload(fileName, file, { cacheControl: '3600', upsert: false })

          if (uploadErr) throw new Error(`Photo upload failed: ${uploadErr.message}`)

          const { data: publicUrlData } = supabase.storage
            .from('device-evidence')
            .getPublicUrl(fileName)

          // Insert into evidence_logs
          await supabase.from('evidence_logs').insert({
            shop_id: shopId,
            ticket_id: ticket.id,
            photo_url: publicUrlData.publicUrl,
            storage_path: fileName
          })
        }
        toast.dismiss('upload')
      }

      toast.success(`Ticket ${ticket.ticket_number} created successfully!`)
      router.push(`/dashboard/tickets/${ticket.id}`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fade-in max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ── Left Column: Customer & Device ── */}
        <div className="space-y-8">
          {/* Customer Info */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-brand-500" /> Customer Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name *</label>
                <input {...register('customer_name')} className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500" />
                {errors.customer_name && <p className="text-xs text-red-400 mt-1">{errors.customer_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number *</label>
                <input {...register('customer_phone')} type="tel" className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500" />
                {errors.customer_phone && <p className="text-xs text-red-400 mt-1">{errors.customer_phone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email (Optional)</label>
                <input {...register('customer_email')} type="email" className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
          </div>

          {/* Device Info */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-brand-500" /> Device Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Brand</label>
                  <input {...register('device_brand')} placeholder="e.g. Apple, Dell" className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Model *</label>
                  <input {...register('device_model')} placeholder="e.g. iPhone 13 Pro" className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500" />
                  {errors.device_model && <p className="text-xs text-red-400 mt-1">{errors.device_model.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Serial Number / IMEI (Optional)</label>
                <input {...register('device_serial')} className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Issue & Evidence ── */}
        <div className="space-y-8">
          {/* Issue Details */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-brand-500" /> Issue Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description *</label>
                <textarea {...register('issue_description')} rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500 resize-none" placeholder="Describe the customer's complaint..."></textarea>
                {errors.issue_description && <p className="text-xs text-red-400 mt-1">{errors.issue_description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
                  <select {...register('priority')} className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Estimated Cost</label>
                  <input {...register('estimated_cost', { valueAsNumber: true })} type="number" step="0.01" min="0" placeholder="0.00" className="w-full px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Included Accessories</label>
                <div className="flex gap-2 mb-2">
                  <input value={accInput} onChange={e => setAccInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddAccessory(); } }} placeholder="e.g. Charger, Bag" className="flex-1 px-3 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-500 text-sm" />
                  <button type="button" onClick={handleAddAccessory} className="px-3 py-2 bg-accent hover:bg-accent/80 rounded-xl text-sm font-medium transition-colors">Add</button>
                </div>
                {accessories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {accessories.map(acc => (
                      <span key={acc} className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-500/10 text-brand-400 rounded-lg text-xs font-medium border border-brand-500/20">
                        {acc}
                        <button type="button" onClick={() => handleRemoveAccessory(acc)} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Evidence Upload */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-brand-500" /> Condition Evidence
            </h2>
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground mb-2">Take photos of existing scratches, dents, or condition before intake.</p>
              
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-xl hover:border-brand-500 hover:bg-accent/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-6 h-6 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">Click to upload photos (Max 5)</p>
                </div>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} disabled={evidenceFiles.length >= 5} />
              </label>

              {evidenceFiles.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {evidenceFiles.map((file, i) => (
                    <div key={i} className="relative aspect-square rounded-lg border border-border overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(file)} alt="Evidence" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeFile(i)} className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-500 rounded-md text-white transition-colors opacity-0 group-hover:opacity-100">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing Intake...</> : <><CheckCircle2 className="w-5 h-5" /> Create Repair Ticket</>}
          </button>

        </div>
      </div>
    </form>
  )
}
