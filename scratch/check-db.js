// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: '.env.local' });
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config({ path: '.env' });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: users } = await supabase.from('users').select('id, email, full_name');
  console.log('--- USERS ---');
  console.table(users);

  const { data: subs } = await supabase.from('subscriptions').select('user_id, plan, status, stripe_subscription_id');
  console.log('--- SUBSCRIPTIONS ---');
  console.table(subs);
}

check();
