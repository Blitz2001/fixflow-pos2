import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testBilling() {
  const { data: shops } = await supabase.from('shops').select('id, name').limit(1)
  if (!shops || shops.length === 0) return
  
  const shopId = shops[0].id
  console.log(`Simulating Past Due for shop: ${shops[0].name} (${shopId})`)

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  await supabase.from('shops').update({
    next_billing_date: yesterday.toISOString(),
    subscription_status: 'active' // Passive guard will update this
  } as any).eq('id', shopId)

  console.log('Update complete. Open dashboard to see the banner.')
}

testBilling()
