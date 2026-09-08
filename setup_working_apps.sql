-- Create Aura Apps table
CREATE TABLE IF NOT EXISTS public.aura_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert default apps
INSERT INTO public.aura_apps (name) VALUES 
  ('Aura Learning'), 
  ('Aura Play'), 
  ('Aura Community ACT'), 
  ('Aura Movie'), 
  ('Aura Store')
ON CONFLICT (name) DO NOTHING;

-- Create Member App Access table
CREATE TABLE IF NOT EXISTS public.member_app_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES public.aura_apps(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(member_id, app_id)
);

-- Create Audit Log table
CREATE TABLE IF NOT EXISTS public.access_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES public.aura_apps(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.aura_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_app_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies for aura_apps
CREATE POLICY "Anyone can read apps" ON public.aura_apps FOR SELECT USING (true);
CREATE POLICY "Admins can manage apps" ON public.aura_apps USING (public.is_admin());

-- Policies for member_app_access
CREATE POLICY "Members can read own active access" ON public.member_app_access
  FOR SELECT USING (auth.uid() = member_id AND status = 'active');
CREATE POLICY "Admins can read all access" ON public.member_app_access
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert access" ON public.member_app_access
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update access" ON public.member_app_access
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete access" ON public.member_app_access
  FOR DELETE USING (public.is_admin());

-- Policies for access_audit_log
CREATE POLICY "Admins can read audit log" ON public.access_audit_log FOR SELECT USING (public.is_admin());

-- Create RPC function to handle assignment securely
CREATE OR REPLACE FUNCTION public.admin_manage_app_access(
  p_member_id UUID,
  p_app_id UUID,
  p_status TEXT
) RETURNS JSON AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_member_status TEXT;
  v_current_status TEXT;
BEGIN
  -- 1. Security Check: Is the caller an admin?
  SELECT public.is_admin() INTO v_is_admin;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can perform this action';
  END IF;

  -- 2. Check if the member is actually an accepted member
  SELECT status INTO v_member_status FROM public.profiles WHERE id = p_member_id;
  IF v_member_status != 'member' THEN
    RAISE EXCEPTION 'User is not an eligible member';
  END IF;

  -- 3. Check current status to avoid redundant audit logs
  SELECT status INTO v_current_status FROM public.member_app_access 
  WHERE member_id = p_member_id AND app_id = p_app_id;

  IF v_current_status IS NULL OR v_current_status != p_status THEN
    -- 4. Upsert the access record
    INSERT INTO public.member_app_access (member_id, app_id, assigned_by, status, updated_at)
    VALUES (p_member_id, p_app_id, auth.uid(), p_status, timezone('utc'::text, now()))
    ON CONFLICT (member_id, app_id) DO UPDATE 
    SET status = EXCLUDED.status, 
        assigned_by = EXCLUDED.assigned_by,
        updated_at = EXCLUDED.updated_at;

    -- 5. Insert audit log
    INSERT INTO public.access_audit_log (member_id, app_id, admin_id, action)
    VALUES (p_member_id, p_app_id, auth.uid(), 'status_changed_to_' || p_status);
  END IF;

  RETURN json_build_object('success', true, 'member_id', p_member_id, 'app_id', p_app_id, 'status', p_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
