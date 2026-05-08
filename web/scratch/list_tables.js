const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ounfzvbdgfatzrewtxww.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91bmZ6dmJkZ2ZhdHpyZXd0eHd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzczNjc4OCwiZXhwIjoyMDkzMzEyNzg4fQ.HMAxUgBeT7iDMfG4Vr6ISV9krFtCLbKPUXkCuFMQ-00'
);

async function checkTables() {
  const { data, error } = await supabase.from('repair_tickets').select('*').limit(1);
  console.log('repair_tickets check:', { data, error });

  // Try creating a dynamic test support message table using raw schema query
  const { data: testMsg, error: msgErr } = await supabase.from('support_messages').select('*').limit(1);
  console.log('support_messages check:', { data: testMsg, error: msgErr });
}

checkTables();
