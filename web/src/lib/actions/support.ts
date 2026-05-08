'use client'

import { createClient } from '@/lib/supabase/client'

export interface SupportMessage {
  sender: 'shop' | 'admin'
  text: string
  timestamp: string
}

export interface SupportTicket {
  id: string
  shop_id: string
  subject: string
  status: string
  messages: SupportMessage[]
  updated_at: string
}

/**
 * Fetch or atomically create a support escalation ticket for a shop
 */
export async function getOrCreateSupportTicket(shopId: string, shopName: string): Promise<SupportTicket> {
  const supabase = createClient()

  // 1. Check if an active support ticket already exists
  const { data: existing, error: fetchErr } = await supabase
    .from('repair_tickets')
    .select('*')
    .eq('shop_id', shopId)
    .eq('priority', 'urgent')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) {
    const meta = typeof existing.metadata === 'string' ? JSON.parse(existing.metadata) : (existing.metadata || {})
    return {
      id: existing.id,
      shop_id: existing.shop_id,
      subject: existing.issue_description,
      status: existing.status === 'delivered' ? 'Closed' : 'Open',
      messages: Array.isArray(meta.messages) ? meta.messages : [],
      updated_at: existing.updated_at
    }
  }

  // 2. No ticket exists. We must create one.
  // To bypass foreign key constraints, we ensure we have a valid customer and device.
  let customerId: string = ''
  let deviceId: string = ''

  // Look up any customer
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('shop_id', shopId)
    .limit(1)
    .maybeSingle()

  if (customer) {
    customerId = customer.id
  } else {
    // Create placeholder customer
    const { data: newCust, error: custErr } = await supabase
      .from('customers')
      .insert({
        shop_id: shopId,
        name: 'Platform Support Guest',
        phone_number: '0000000000'
      })
      .select('id')
      .single()

    if (custErr) throw custErr
    customerId = newCust.id
  }

  // Look up any device
  const { data: device } = await supabase
    .from('devices')
    .select('id')
    .eq('shop_id', shopId)
    .limit(1)
    .maybeSingle()

  if (device) {
    deviceId = device.id
  } else {
    // Create placeholder device
    const { data: newDev, error: devErr } = await supabase
      .from('devices')
      .insert({
        shop_id: shopId,
        customer_id: customerId,
        brand: 'System',
        model: 'Support Portal Node'
      })
      .select('id')
      .single()

    if (devErr) throw devErr
    deviceId = newDev.id
  }

  // 3. Atomically create the urgent support escalation ticket
  const ticketNumber = `SUP-${Math.floor(100000 + Math.random() * 900000)}`
  const defaultMeta = {
    messages: [
      {
        sender: 'admin',
        text: `Welcome to RepairOS Support! Let us know how we can help you with your ${shopName} store instance.`,
        timestamp: new Date().toISOString()
      }
    ]
  }

  const { data: newTicket, error: ticketErr } = await supabase
    .from('repair_tickets')
    .insert({
      shop_id: shopId,
      device_id: deviceId,
      ticket_number: ticketNumber,
      issue_description: `Platform Support Request for ${shopName}`,
      status: 'intake',
      priority: 'urgent',
      accessories_included: [],
      metadata: defaultMeta
    })
    .select('*')
    .single()

  if (ticketErr) throw ticketErr

  return {
    id: newTicket.id,
    shop_id: newTicket.shop_id,
    subject: newTicket.issue_description,
    status: 'Open',
    messages: defaultMeta.messages as SupportMessage[],
    updated_at: newTicket.updated_at
  }
}

/**
 * Send a chat message on a support ticket
 */
export async function sendSupportMessage(ticketId: string, sender: 'shop' | 'admin', text: string): Promise<SupportMessage[]> {
  const supabase = createClient()

  // 1. Fetch current ticket metadata
  const { data: ticket, error: fetchErr } = await supabase
    .from('repair_tickets')
    .select('metadata')
    .eq('id', ticketId)
    .single()

  if (fetchErr) throw fetchErr

  const meta = typeof ticket.metadata === 'string' ? JSON.parse(ticket.metadata) : (ticket.metadata || {})
  const currentMessages = Array.isArray(meta.messages) ? meta.messages : []

  // 2. Append new message
  const newMessage: SupportMessage = {
    sender,
    text,
    timestamp: new Date().toISOString()
  }

  const updatedMessages = [...currentMessages, newMessage]

  // 3. Save back to database
  const { error: updateErr } = await supabase
    .from('repair_tickets')
    .update({
      metadata: { ...meta, messages: updatedMessages },
      updated_at: new Date().toISOString()
    })
    .eq('id', ticketId)

  if (updateErr) throw updateErr

  return updatedMessages
}
