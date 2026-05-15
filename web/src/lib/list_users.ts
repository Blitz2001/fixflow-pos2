import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function getUsers() {
  const { data: users, error } = await supabase.auth.admin.listUsers()
  if (error) {
    console.error('Error:', error)
    return
  }
  
  if (users.users.length > 0) {
    console.log('Available users:')
    users.users.forEach(u => console.log(u.email))
  } else {
    console.log('No users found in the system!')
  }
}

getUsers()
