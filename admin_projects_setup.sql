CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT,
  logo TEXT,
  cover_image TEXT,
  link TEXT,
  apk_link TEXT,
  verified BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  visible_on_home BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  tags JSONB DEFAULT '[]'::jsonb,
  links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published projects" ON public.projects FOR SELECT USING (published = true OR public.is_admin());
CREATE POLICY "Admins can insert projects" ON public.projects FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update projects" ON public.projects FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE USING (public.is_admin());

-- Insert default projects from config
INSERT INTO public.projects (name, short_description, description, category, status, logo, link, apk_link, verified, tags, display_order) 
VALUES 
('Mission GTA Mobile', 'An experimental Android porting and optimization project focused on bringing a large-scale GTA V experience to compatible high-performance Snapdragon devices.', 'An experimental Android porting and optimization project focused on bringing a large-scale GTA V experience to compatible high-performance Snapdragon devices.', 'Gaming / Porting • Android', 'In Development', 'mission-gta-logo.svg', '/projects/mission-gta-mobile', NULL, false, '["mission gta mobile", "gta v", "android port", "snapdragon", "gaming"]'::jsonb, 1),
('ACode', 'A fast and lightweight Android code editor designed for developers who want a VS Code-inspired coding experience on mobile.', 'A fast and lightweight Android code editor designed for developers who want a VS Code-inspired coding experience on mobile.', 'Developer Tools • Android', 'Available', 'acode-logo.svg', '#', 'https://gofile.io/d/v1xDGISx', true, '["acode", "code editor", "android editor", "vs code", "vs code alternative", "developer tools"]'::jsonb, 2),
('Aura Learning', 'A technology-supported educational platform for continuous learning.', 'A technology-supported educational platform for continuous learning.', 'Education', 'Active', 'https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/app-icons/opened_book_logo_1782632258077.jpg', 'https://aura.auralearning.workers.dev', NULL, true, '[]'::jsonb, 3),
('Aura Play', 'Aura Play is a gaming-focused platform under Aura Community Act, designed to bring gaming content, experiences, and community features together in one place.', 'Aura Play is a gaming-focused platform under Aura Community Act, designed to bring gaming content, experiences, and community features together in one place.', 'Gaming / Gaming Platform', 'Coming Soon', 'https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/app-icons/file_000000003378820ea02df9bf500b37bd.png', '#', NULL, false, '[]'::jsonb, 4);

