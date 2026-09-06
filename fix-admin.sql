-- 1. Create function to sync application status to profile automatically
CREATE OR REPLACE FUNCTION public.sync_application_status_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- If status has changed
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    UPDATE public.profiles
    SET status = NEW.status
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Trigger
DROP TRIGGER IF EXISTS tr_sync_app_status ON public.community_applications;
CREATE TRIGGER tr_sync_app_status
AFTER UPDATE OF status ON public.community_applications
FOR EACH ROW
EXECUTE FUNCTION public.sync_application_status_to_profile();

-- 3. Ensure rejection_reason column exists (it is already in schema but just in case)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_applications' AND column_name='rejection_reason') THEN
    ALTER TABLE public.community_applications ADD COLUMN rejection_reason TEXT;
  END IF;
END $$;

