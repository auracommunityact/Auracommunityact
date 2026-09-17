-- Mission GTA Mobile Database Schema

CREATE TABLE IF NOT EXISTS public.project_galleries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.project_galleries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view project galleries" ON public.project_galleries FOR SELECT USING (true);
CREATE POLICY "Admins can insert project galleries" ON public.project_galleries FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update project galleries" ON public.project_galleries FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete project galleries" ON public.project_galleries FOR DELETE USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  storage_path TEXT,
  links JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published project updates" ON public.project_updates FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "Admins can insert project updates" ON public.project_updates FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update project updates" ON public.project_updates FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete project updates" ON public.project_updates FOR DELETE USING (public.is_admin());

-- Storage policies for existing app-icons bucket (or create project-assets)
-- Since they likely use app-icons for other stuff, we'll create project-assets
INSERT INTO storage.buckets (id, name, public) VALUES ('project-assets', 'project-assets', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can view project-assets" ON storage.objects FOR SELECT USING (bucket_id = 'project-assets');
CREATE POLICY "Admins can upload to project-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-assets' AND public.is_admin());
CREATE POLICY "Admins can update project-assets" ON storage.objects FOR UPDATE USING (bucket_id = 'project-assets' AND public.is_admin());
CREATE POLICY "Admins can delete project-assets" ON storage.objects FOR DELETE USING (bucket_id = 'project-assets' AND public.is_admin());
