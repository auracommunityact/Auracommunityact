-- SUPABASE SCHEMA FOR AURA COMMUNITY ACT
-- Copy and paste this script into your Supabase SQL Editor and run it.

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  username TEXT UNIQUE,
  email TEXT,
  country TEXT,
  age_group TEXT,
  role TEXT,
  skills_interests TEXT,
  about TEXT,
  status TEXT DEFAULT 'not_applied',
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Community Applications Table
CREATE TABLE IF NOT EXISTS public.community_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT,
  username TEXT,
  email TEXT,
  country TEXT,
  city_state TEXT,
  age_group TEXT,
  role TEXT,
  skills_interests TEXT,
  introduction TEXT,
  reason_to_join TEXT,
  contribution TEXT,
  community_interests TEXT,
  discord TEXT,
  youtube TEXT,
  instagram TEXT,
  github TEXT,
  website TEXT,
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Turn on RLS for community_applications
ALTER TABLE public.community_applications ENABLE ROW LEVEL SECURITY;

-- 3. Create Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Policy: Admin Check Helper Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ) OR (
    -- Hardcode the primary admin email here for fail-safe
    SELECT auth.email() = 'auracommunityact@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- PROFILES POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.is_admin());

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (public.is_admin());


-- COMMUNITY APPLICATIONS POLICIES
-- Users can view their own applications
CREATE POLICY "Users can view own applications" 
ON public.community_applications FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications" 
ON public.community_applications FOR SELECT 
USING (public.is_admin());

-- Users can insert their own application
CREATE POLICY "Users can insert own application" 
ON public.community_applications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can update all applications
CREATE POLICY "Admins can update all applications" 
ON public.community_applications FOR UPDATE 
USING (public.is_admin());


-- CONTACT MESSAGES POLICIES
-- Anyone can insert a contact message (even unauthenticated)
CREATE POLICY "Anyone can insert contact messages" 
ON public.contact_messages FOR INSERT 
WITH CHECK (true);

-- Only admins can view contact messages
CREATE POLICY "Admins can view contact messages" 
ON public.contact_messages FOR SELECT 
USING (public.is_admin());

-- Only admins can update contact messages
CREATE POLICY "Admins can update contact messages" 
ON public.contact_messages FOR UPDATE 
USING (public.is_admin());

-- Only admins can delete contact messages
CREATE POLICY "Admins can delete contact messages" 
ON public.contact_messages FOR DELETE 
USING (public.is_admin());

-- Set primary admin flag (Run this if the user exists, otherwise it will just complete without error)
UPDATE public.profiles SET is_admin = true WHERE email = 'auracommunityact@gmail.com';
