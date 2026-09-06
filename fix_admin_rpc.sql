-- Create an RPC function for Admin to update application status atomically
CREATE OR REPLACE FUNCTION public.admin_update_application_status(
  app_id UUID,
  new_status TEXT,
  rej_reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  -- 1. Security Check: Is the caller an admin?
  SELECT public.is_admin() INTO v_is_admin;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can perform this action';
  END IF;

  -- 2. Get the application's user_id
  SELECT user_id INTO v_user_id
  FROM public.community_applications
  WHERE id = app_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  -- 3. Update the community application
  UPDATE public.community_applications
  SET 
    status = new_status,
    rejection_reason = rej_reason,
    reviewed_at = timezone('utc'::text, now()),
    reviewed_by = auth.uid()
  WHERE id = app_id;

  -- 4. Sync the profile status
  UPDATE public.profiles
  SET status = new_status
  WHERE id = v_user_id;

  RETURN json_build_object('success', true, 'app_id', app_id, 'status', new_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
