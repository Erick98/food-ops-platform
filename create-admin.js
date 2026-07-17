const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lxqbpdbivhmdztoivclw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4cWJwZGJpdmhtZHp0b2l2Y2x3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDI2NDIwNSwiZXhwIjoyMDk5ODQwMjA1fQ.CMx7zTY0LoJGGr4wXICLdHBrFyMj7d_LHaPHIbZ0zWg'
);

async function main() {
  // 1. Fetch tenant ID for 'Ito Café'
  const { data: tenant, error: tenantErr } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', 'ito-cafe')
    .single();

  if (tenantErr || !tenant) {
    console.error('Error fetching tenant:', tenantErr);
    return;
  }

  console.log('Tenant ID found:', tenant.id);

  // 2. Create the User
  const email = 'admin@bernavcapital.com';
  const password = 'BernavPassword2026!';
  
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      tenant_id: tenant.id,
      full_name: 'Erick Bernal (Admin)'
    }
  });

  if (authErr) {
    console.error('Error creating user:', authErr);
    return;
  }

  console.log('User created:', authData.user.id);

  // Wait a sec for the trigger to insert the profile
  await new Promise(r => setTimeout(r, 2000));

  // 3. Update profile to 'admin'
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', authData.user.id);

  if (profileErr) {
    console.error('Error updating profile role:', profileErr);
  } else {
    console.log('Profile updated to admin role successfully!');
  }
}

main();
