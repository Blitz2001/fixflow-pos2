const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkRoles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
  
  if (error) {
    console.error(error)
    return
  }

  const counts = data.reduce((acc, p) => {
    acc[p.role] = (acc[p.role] || 0) + 1
    return acc
  }, {})

  console.log('Role counts:', counts)
}

checkRoles()
