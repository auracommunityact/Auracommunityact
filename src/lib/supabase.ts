import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  country: string | null;
  age_group: string | null;
  role: string | null;
  skills_interests: string | null;
  about: string | null;
  status: 'not_applied' | 'pending' | 'under_review' | 'approved' | 'rejected';
  created_at: string;
  avatar_url?: string;
  is_admin?: boolean;
};

export type CommunityApplication = {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  email: string;
  country: string;
  city_state: string | null;
  age_group: string;
  role: string;
  skills_interests: string;
  introduction: string;
  reason_to_join: string;
  contribution: string;
  community_interests: string;
  discord: string | null;
  youtube: string | null;
  instagram: string | null;
  github: string | null;
  website: string | null;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  rejection_reason: string | null;
  admin_notes: string | null;
  submitted_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};
