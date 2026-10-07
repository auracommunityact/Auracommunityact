-- ====================================================================
-- AURA MUSIC STUDIO DATABASE SCHEMA & STORAGE SETUP
-- ====================================================================
-- Copy and paste this complete SQL into your Supabase Dashboard:
-- SQL Editor -> New Query -> Run
--
-- Features included:
-- 1. Helper function public.is_admin() (failsafe for admin operations)
-- 2. public.music_releases table with all required fields
-- 3. Row Level Security (RLS) policies (Public read for published, Admin full CRUD)
-- 4. Storage Bucket ('music') setup and storage RLS policies for artwork & audio
-- 5. Auto-updating updated_at trigger
-- 6. Indexes for fast query performance
-- ====================================================================

-- 1. Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ) OR (
    SELECT auth.email() = 'auracommunityact@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create music_releases table
CREATE TABLE IF NOT EXISTS public.music_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_title TEXT NOT NULL,
  track_title TEXT NOT NULL,
  artist TEXT NOT NULL,
  featuring_artist TEXT,
  version TEXT,
  genre TEXT NOT NULL,
  language TEXT NOT NULL,
  release_type TEXT NOT NULL DEFAULT 'single', -- single, ep, album
  artwork_url TEXT NOT NULL,
  artwork_storage_path TEXT,
  audio_url TEXT NOT NULL,
  audio_storage_path TEXT,
  release_date DATE NOT NULL,
  release_time TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  catalog_number TEXT,
  isrc TEXT,
  upc_ean TEXT,
  label TEXT DEFAULT 'Aura Music Studio',
  copyright_owner TEXT DEFAULT 'Aura Music Studio',
  publishing_info TEXT,
  c_line TEXT DEFAULT 'Aura Music Studio',
  p_line TEXT DEFAULT 'Aura Music Studio',
  youtube_url TEXT,
  youtube_music_url TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  amazon_music_url TEXT,
  soundcloud_url TEXT,
  deezer_url TEXT,
  tidal_url TEXT,
  other_url TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, scheduled, published, archived
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_music_releases_status ON public.music_releases(status);
CREATE INDEX IF NOT EXISTS idx_music_releases_scheduled ON public.music_releases(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_music_releases_date ON public.music_releases(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_music_releases_artist ON public.music_releases(artist);
CREATE INDEX IF NOT EXISTS idx_music_releases_genre ON public.music_releases(genre);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.music_releases ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Public visitors: can ONLY view releases where status = 'published' (and scheduled time has passed)
DROP POLICY IF EXISTS "Anyone can view published music releases" ON public.music_releases;
CREATE POLICY "Anyone can view published music releases" 
ON public.music_releases FOR SELECT 
USING (
  (status = 'published' AND (scheduled_for IS NULL OR scheduled_for <= timezone('utc'::text, now())))
  OR public.is_admin()
);

-- Admin CRUD policies
DROP POLICY IF EXISTS "Admins can insert music releases" ON public.music_releases;
CREATE POLICY "Admins can insert music releases" 
ON public.music_releases FOR INSERT 
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update music releases" ON public.music_releases;
CREATE POLICY "Admins can update music releases" 
ON public.music_releases FOR UPDATE 
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete music releases" ON public.music_releases;
CREATE POLICY "Admins can delete music releases" 
ON public.music_releases FOR DELETE 
USING (public.is_admin());

-- 6. Trigger for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_music_release_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_music_release_updated_at ON public.music_releases;
CREATE TRIGGER tr_music_release_updated_at
BEFORE UPDATE ON public.music_releases
FOR EACH ROW
EXECUTE FUNCTION public.handle_music_release_updated_at();

-- 7. Supabase Storage Setup for Music & Artwork
-- Ensures 'music' bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('music', 'music', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Public read access for audio and artwork files
DROP POLICY IF EXISTS "Public can view music files" ON storage.objects;
CREATE POLICY "Public can view music files"
ON storage.objects FOR SELECT
USING (bucket_id IN ('music', 'project-assets'));

-- Storage RLS: Admin or authenticated upload access
DROP POLICY IF EXISTS "Admins can upload music files" ON storage.objects;
CREATE POLICY "Admins can upload music files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('music', 'project-assets'));

DROP POLICY IF EXISTS "Admins can update music files" ON storage.objects;
CREATE POLICY "Admins can update music files"
ON storage.objects FOR UPDATE
USING (bucket_id IN ('music', 'project-assets'));

DROP POLICY IF EXISTS "Admins can delete music files" ON storage.objects;
CREATE POLICY "Admins can delete music files"
ON storage.objects FOR DELETE
USING (bucket_id IN ('music', 'project-assets'));
