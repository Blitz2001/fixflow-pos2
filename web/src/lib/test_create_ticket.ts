import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const shopId = 'e0d5f3c6-2126-4b12-9d5c-0bdb02a52799'
  console.log(`Using shopId: ${shopId}`)

  try {
    // 1. Create partner
    console.log('Creating partner...')
    const { data: partner, error: pErr } = await supabase
      .from('partners')
      .insert({
        shop_id: shopId,
        name: 'Test Customer',
        phone: '0771234567',
        partner_types: ['is_customer']
      })
      .select('id')
      .single()
    
    if (pErr) {
      console.error('Partner error:', pErr)
      return
    }
    console.log('Partner created:', partner.id)

    // 2. Create device
    console.log('Creating device...')
    const { data: device, error: dErr } = await supabase
      .from('devices')
      .insert({
        shop_id: shopId,
        partner_id: partner.id,
        model: 'Test iPhone'
      })
      .select('id')
      .single()
    
    if (dErr) {
      console.error('Device error:', dErr)
      return
    }
    console.log('Device created:', device.id)

    // 3. Generate ticket number
    console.log('Generating ticket number...')
    const { data: ticketNum, error: rpcErr } = await supabase
      .rpc('generate_ticket_number', { p_shop_id: shopId })
    
    if (rpcErr) {
      console.error('RPC error:', rpcErr)
      // Fallback
    }
    const finalTicketNum = ticketNum ?? `PC-${Date.now()}`
    console.log('Ticket number:', finalTicketNum)

    // 4. Create ticket
    console.log('Creating ticket...')
    const { data: ticket, error: tErr } = await supabase
      .from('repair_tickets')
      .insert({
        shop_id: shopId,
        device_id: device.id,
        ticket_number: finalTicketNum,
        issue_description: 'Screen broken',
        status: 'intake',
        metadata: {}
      })
      .select('id')
      .single()
    
    if (tErr) {
      console.error('Ticket error:', tErr)
      return
    }
    console.log('Ticket created successfully:', ticket.id)

  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

test()
