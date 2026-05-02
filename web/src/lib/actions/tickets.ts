'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import type { TicketStatus } from '@/types/database'

// ── Create ticket ─────────────────────────────────────────────────────────────
const createTicketSchema = z.object({
  shop_id:                    z.string().uuid(),
  // Customer
  customer_name:              z.string().min(1),
  customer_phone:             z.string().min(5),
  customer_email:             z.string().email().optional().or(z.literal('')),
  // Device
  device_brand:               z.string().optional(),
  device_model:               z.string().min(1),
  device_serial:              z.string().optional(),
  // Ticket
  issue_description:          z.string().min(3),
  priority:                   z.enum(['low','normal','high','urgent']).default('normal'),
  estimated_cost:             z.number().positive().optional(),
  estimated_completion_date:  z.string().optional(),
  accessories_included:       z.array(z.string()).default([]),
  assigned_to:                z.string().uuid().optional(),
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>

export async function createTicket(input: CreateTicketInput) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const parsed = createTicketSchema.parse(input)

  // 1. Upsert customer (search by phone first)
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .eq('shop_id', parsed.shop_id)
    .eq('phone_number', parsed.customer_phone)
    .single()

  let customerId: string
  if (existingCustomer) {
    customerId = existingCustomer.id
  } else {
    const { data: newCustomer, error: custErr } = await supabase
      .from('customers')
      .insert({
        shop_id:      parsed.shop_id,
        name:         parsed.customer_name,
        phone_number: parsed.customer_phone,
        email:        parsed.customer_email || null,
      })
      .select('id')
      .single()
    if (custErr) throw new Error(custErr.message)
    customerId = newCustomer.id
  }

  // 2. Create device
  const { data: device, error: devErr } = await supabase
    .from('devices')
    .insert({
      shop_id:       parsed.shop_id,
      customer_id:   customerId,
      brand:         parsed.device_brand || null,
      model:         parsed.device_model,
      serial_number: parsed.device_serial || null,
    })
    .select('id')
    .single()
  if (devErr) throw new Error(devErr.message)

  // 3. Generate ticket number
  const { data: ticketNum } = await supabase
    .rpc('generate_ticket_number', { p_shop_id: parsed.shop_id })

  // 4. Create ticket
  const { data: ticket, error: ticketErr } = await supabase
    .from('repair_tickets')
    .insert({
      shop_id:                   parsed.shop_id,
      device_id:                 device.id,
      ticket_number:             ticketNum ?? `PC-${Date.now()}`,
      issue_description:         parsed.issue_description,
      priority:                  parsed.priority,
      estimated_cost:            parsed.estimated_cost ?? null,
      estimated_completion_date: parsed.estimated_completion_date ?? null,
      accessories_included:      parsed.accessories_included,
      assigned_to:               parsed.assigned_to ?? null,
      status:                    'intake',
      metadata:                  {},
    })
    .select('id, ticket_number')
    .single()
  if (ticketErr) throw new Error(ticketErr.message)

  // 5. Log to activity_logs for DS pipeline
  await supabase.from('activity_logs').insert({
    shop_id:     parsed.shop_id,
    user_id:     user.id,
    action_type: 'ticket.created',
    payload:     { ticket_id: ticket.id, ticket_number: ticket.ticket_number, priority: parsed.priority },
  })

  revalidatePath('/dashboard/tickets')
  return ticket
}

// ── Update ticket status ──────────────────────────────────────────────────────
export async function updateTicketStatus(
  ticketId: string,
  newStatus: TicketStatus,
  note?: string,
) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('repair_tickets')
    .update({
      status:       newStatus,
      delivered_at: newStatus === 'delivered' ? new Date().toISOString() : undefined,
    })
    .eq('id', ticketId)
  if (error) throw new Error(error.message)

  // status_history row is auto-inserted by DB trigger (log_ticket_status_change)
  // Optionally add a note to the history manually
  if (note) {
    await supabase.from('ticket_status_history').insert({
      ticket_id:  ticketId,
      shop_id:    (await supabase.from('repair_tickets').select('shop_id').eq('id', ticketId).single()).data?.shop_id ?? '',
      to_status:  newStatus,
      changed_by: user.id,
      note,
    })
  }

  revalidatePath(`/dashboard/tickets/${ticketId}`)
  revalidatePath('/dashboard/tickets')
  revalidatePath('/dashboard')
}

// ── Update technician notes ───────────────────────────────────────────────────
export async function updateTechnicianNotes(ticketId: string, notes: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('repair_tickets')
    .update({ technician_notes: notes })
    .eq('id', ticketId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/tickets/${ticketId}`)
}

// ── Generate WhatsApp update link ─────────────────────────────────────────────
export async function getWhatsAppUpdateLink(ticketId: string, shopName: string) {
  const supabase = await createServerClient()
  const { data: ticket } = await supabase
    .from('repair_tickets')
    .select(`
      ticket_number, status,
      device:devices(model, customer:customers(name, phone_number))
    `)
    .eq('id', ticketId)
    .single()

  if (!ticket) throw new Error('Ticket not found')

  const device   = ticket.device as { model: string; customer: { name: string; phone_number: string } }
  const name     = device?.customer?.name ?? 'Customer'
  const phone    = device?.customer?.phone_number?.replace(/\D/g, '') ?? ''
  const model    = device?.model ?? 'your device'
  const status   = ticket.status.replace('_', ' ')
  const trackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/track/${ticket.ticket_number}`

  const message = encodeURIComponent(
    `Hi ${name}, your ${model} (Ticket ${ticket.ticket_number}) is now *${status}* at ${shopName}. Track here: ${trackUrl}`
  )

  return `https://wa.me/${phone}?text=${message}`
}
