-- Fix function search_path security issue (with CASCADE)
DROP FUNCTION IF EXISTS public.check_meeting_booking_rate_limit() CASCADE;

CREATE OR REPLACE FUNCTION public.check_meeting_booking_rate_limit()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_count INTEGER;
BEGIN
  -- Check if more than 5 bookings in the last hour from same email
  SELECT COUNT(*) INTO booking_count
  FROM public.scheduled_meetings
  WHERE attendee_email = NEW.attendee_email
  AND created_at > NOW() - INTERVAL '1 hour';
  
  IF booking_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER meeting_booking_rate_limit
BEFORE INSERT ON public.scheduled_meetings
FOR EACH ROW
EXECUTE FUNCTION public.check_meeting_booking_rate_limit();