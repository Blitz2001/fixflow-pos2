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
    // ... (previous steps) ...
    // Assuming we have ticket.id and ticket_number from previous run or just create a new one
    const ticketId = '19c55489-980f-4d24-a2f8-58e1b9f206f0'
    const ticketNumber = 'PC-1001'

    console.log('Logging activity...')
    const { error: logErr } = await supabase.from('activity_logs').insert({
      shop_id: shopId,
      user_id: 'some-user-id', // I need a real user id from profiles
      action_type: 'ticket.created',
      payload: { ticket_id: ticketId, ticket_number: ticketNumber, priority: 'normal' }
    })

    if (logErr) {
      console.error('Activity Log error:', logErr)
    } else {
      console.log('Activity logged successfully')
    }

  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

test()
