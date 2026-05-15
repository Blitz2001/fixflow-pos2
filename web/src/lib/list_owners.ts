import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data: memberships } = await supabase.from('memberships').select('user_id, role')
  const { data: users } = await supabase.auth.admin.listUsers()
  
  const owners = memberships?.filter(m => m.role === 'OWNER') || []
  owners.forEach(m => {
    const u = users?.users.find(user => user.id === m.user_id)
    console.log('Owner email:', u?.email)
  })
}

run()
