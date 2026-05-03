'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const customerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
})

export async function createCustomer(shopId: string, data: z.infer<typeof customerSchema>) {
  const supabase = await createServerClient()
  
  const { error } = await supabase
    .from('partners')
    .insert({
      shop_id: shopId,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      partner_types: ['is_customer'],
    })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/customers')
}
