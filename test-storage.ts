import { supabase } from './src/lib/supabase.js';
async function run() {
  const { data, error } = await supabase.storage.listBuckets();
  console.log("Buckets:", data);
  console.log("Error:", error);
}
run();
