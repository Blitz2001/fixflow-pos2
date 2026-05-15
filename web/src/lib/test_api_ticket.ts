import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// This uses anon key, same as the client app
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testApi() {
  console.log('Logging in...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'pos.admin.test@gmail.com',
    password: 'password123'
  })

  if (authError) {
    console.error('Login failed:', authError.message)
    process.exit(1)
  }

  console.log('Logged in as:', authData.user.id)
  
  const token = authData.session.access_token

  console.log('Creating ticket via API...')
  const res = await fetch('http://localhost:3001/api/v1/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      customer_name: 'Test Customer ' + Date.now(),
      customer_phone: '077000' + Math.floor(Math.random() * 1000),
      device_model: 'MacBook Pro M1',
      issue_description: 'Screen broken, needs replacement',
      priority: 'high'
    })
  })

  const text = await res.text()
  console.log('Response Status:', res.status)
  console.log('Response Body:', text)
}

testApi()
