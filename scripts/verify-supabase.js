require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyConnection() {
  console.log('Testing connection to Supabase...');
  console.log(`URL: ${supabaseUrl}`);

  try {
    // Simple query to check connection (using a public table like profiles, or just health check if possible)
    // We'll try to select the current timestamp from the database using a simple RPC or just a query
    
    // Since we might not have tables yet if schema wasn't run, let's try to just get the auth settings or a known system table, 
    // but the most reliable way to check "connection" is usually a query.
    // Let's assume the schema IS applied or we just want to check auth connection.
    
    // Attempt 1: Check if we can reach the auth endpoint
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;
    console.log('✅ Auth Service: Accessible');

    // Attempt 2: Run a simple query. Even if table doesn't exist, we get a specific error.
    // Ideally we use a "health check" function if defined, but we don't have one globally.
    // Let's try to fetch 1 row from 'profiles' (if schema applied)
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .maybeSingle();

    if (error) {
       // If the error is "relation does not exist", it means connection is good but schema is missing.
       if (error.code === '42P01') {
         console.log('⚠️  Database connected, but "profiles" table not found. (Did you run the schema?)');
       } else {
         throw error;
       }
    } else {
       console.log('✅ Database: Connected & Schema Detected');
    }

    console.log('\nSUCCESS: Supabase connection verified!');

  } catch (err) {
    console.error('\n❌ Connection Failed:', err.message);
    if(err.cause) console.error('Cause:', err.cause);
  }
}

verifyConnection();
