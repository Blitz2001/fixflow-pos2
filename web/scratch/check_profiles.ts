import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function checkProfiles() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')

  if (error) {
    console.error(error)
    return
  }

  console.log('Profiles in DB:')
  profiles.forEach(p => {
    console.log(`- ${p.full_name || 'No Name'} (${p.email}) ID: ${p.id}`)
  })
}

checkProfiles()
