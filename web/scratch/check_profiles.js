const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=#]+)=([^#]*)/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
    }
  });
  return env;
}

async function checkProfiles() {
  const env = loadEnv();
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error(error);
    return;
  }

  console.log('--- PROFILES START ---');
  profiles.forEach(p => {
    console.log(JSON.stringify(p));
  });
  console.log('--- PROFILES END ---');
}

checkProfiles();
