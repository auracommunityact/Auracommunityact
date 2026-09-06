import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''; // WAIT, I need service key or use RLS. Since I don't have service key or user JWT, I can't easily test RLS directly.

console.log("Supabase URL:", supabaseUrl);
