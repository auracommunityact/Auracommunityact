-- 1. Create an RPC function for Admin to update application status atomically WITH the correct status mapping
CREATE OR REPLACE FUNCTION public.admin_update_application_status(
  app_id UUID,
  new_status TEXT,
  rej_reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_is_admin BOOLEAN;
  v_profile_status TEXT;
BEGIN
  -- Security Check: Is the caller an admin?
  SELECT public.is_admin() INTO v_is_admin;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can perform this action';
  END IF;

  -- Get the application's user_id
  SELECT user_id INTO v_user_id
  FROM public.community_applications
  WHERE id = app_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  -- Map Application Status to Profile Status
  IF new_status = 'accepted' THEN
    v_profile_status := 'member';
  ELSIF new_status = 'rejected' THEN
    v_profile_status := 'user';
  ELSIF new_status = 'under_review' THEN
    v_profile_status := 'under_review';
  ELSE
    v_profile_status := new_status;
  END IF;

  -- Update the community application
  UPDATE public.community_applications
  SET 
    status = new_status,
    rejection_reason = COALESCE(rej_reason, public.community_applications.rejection_reason),
    reviewed_at = timezone('utc'::text, now()),
    reviewed_by = auth.uid()
  WHERE id = app_id;

  -- Sync the profile status safely
  UPDATE public.profiles
  SET status = v_profile_status
  WHERE id = v_user_id;

  RETURN json_build_object('success', true, 'app_id', app_id, 'app_status', new_status, 'profile_status', v_profile_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update the automatic trigger for any non-admin updates (e.g. system flows)
CREATE OR REPLACE FUNCTION public.sync_application_status_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- If status has changed
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'accepted' THEN
      UPDATE public.profiles SET status = 'member' WHERE id = NEW.user_id;
    ELSIF NEW.status = 'rejected' THEN
      UPDATE public.profiles SET status = 'user' WHERE id = NEW.user_id;
    ELSIF NEW.status = 'under_review' THEN
      UPDATE public.profiles SET status = 'under_review' WHERE id = NEW.user_id;
    ELSE
      UPDATE public.profiles SET status = NEW.status WHERE id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Perform a safe data migration of existing incorrect records
UPDATE public.community_applications SET status = 'accepted' WHERE status = 'approved';
UPDATE public.profiles SET status = 'member' WHERE status = 'approved';
UPDATE public.profiles SET status = 'user' WHERE status IN ('not_applied', 'pending', 'rejected');
