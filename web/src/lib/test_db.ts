import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('Testing Supabase connection...')
  const { data: shops, error } = await supabase.from('shops').select('id, name')
  if (error) {
    console.error('Error fetching shops:', error)
    return
  }
  console.log('Shops:', shops)

  if (shops && shops.length > 0) {
    const shopId = shops[0].id
    console.log(`Using shopId: ${shopId}`)

    // Test ticket creation
    console.log('Attempting to create a ticket...')
    // Note: This won't run the Server Action, but it will test the DB directly
    // which helps isolate if it's a DB issue or an app logic issue.
  }
}

test()
