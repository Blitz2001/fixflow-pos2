const { createClient } = require('@supabase/supabase-js')
const supabaseUrl = 'https://ounfzvbdgfatzrewtxww.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91bmZ6dmJkZ2ZhdHpyZXd0eHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MzY3ODgsImV4cCI6MjA5MzMxMjc4OH0.b2o84gSTW5bUFAmYZObB7VLuHMJgJaDfBrZisCegMjw'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function signUp() {
  console.log('Attempting to sign up...')
  const { data, error } = await supabase.auth.signUp({
    email: 'akilainduwara205@gmail.com',
    password: 'akila1234',
    options: {
      data: { full_name: 'Akila' }
    }
  })

  if (error) {
    console.error('Signup Error:', error.message)
    process.exit(1)
  }

  console.log('Signup Successful!')
  console.log('User ID:', data.user?.id)
  console.log('Note: If email confirmation is enabled, check your inbox (or Inbucket if local).')
}

signUp()
