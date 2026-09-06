import { supabase } from './src/lib/supabase.js';
async function run() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log("DATA:", data);
  console.log("ERROR:", error);
}
run();
