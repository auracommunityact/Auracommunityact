CREATE TABLE IF NOT EXISTS public.project_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT UNIQUE NOT NULL,
  fps TEXT DEFAULT 'Testing',
  gpu TEXT DEFAULT 'Testing',
  ram TEXT DEFAULT 'Data N/A',
  stability TEXT DEFAULT 'Testing',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.project_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view project performance" ON public.project_performance FOR SELECT USING (true);
CREATE POLICY "Admins can insert project performance" ON public.project_performance FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update project performance" ON public.project_performance FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete project performance" ON public.project_performance FOR DELETE USING (public.is_admin());

-- Insert default values if not exists
INSERT INTO public.project_performance (project_id, fps, gpu, ram, stability) 
VALUES ('mission-gta-mobile', 'Testing', 'Testing', 'Data N/A', 'Testing')
ON CONFLICT (project_id) DO NOTHING;
