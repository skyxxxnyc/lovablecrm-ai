-- Phase 1.1: Fix Database Security

-- Fix feedback table: Add user_id requirement and proper RLS
-- Note: feedback.user_id already exists but is nullable
ALTER TABLE public.feedback ALTER COLUMN user_id SET NOT NULL;

-- Drop the insecure "Users can create feedback" policy
DROP POLICY IF EXISTS "Users can create feedback" ON public.feedback;

-- Create secure feedback policies
CREATE POLICY "Authenticated users can create own feedback"
ON public.feedback
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix scheduled_meetings table: Remove open insert policy and add authentication
-- Drop the insecure "Anyone can book meetings" policy
DROP POLICY IF EXISTS "Anyone can book meetings" ON public.scheduled_meetings;

-- Add user_id column to scheduled_meetings for proper tracking
ALTER TABLE public.scheduled_meetings 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create secure scheduled_meetings policies
CREATE POLICY "Authenticated users can book meetings"
ON public.scheduled_meetings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM scheduling_links 
    WHERE scheduling_links.id = scheduled_meetings.scheduling_link_id 
    AND scheduling_links.active = true
  )
);

-- Allow users to view meetings for their scheduling links
CREATE POLICY "Users can view meetings for own scheduling links"
ON public.scheduled_meetings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM scheduling_links
    WHERE scheduling_links.id = scheduled_meetings.scheduling_link_id
    AND scheduling_links.user_id = auth.uid()
  )
);

-- Add rate limiting for meeting bookings via trigger
CREATE OR REPLACE FUNCTION public.check_meeting_booking_rate_limit()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER meeting_booking_rate_limit
BEFORE INSERT ON public.scheduled_meetings
FOR EACH ROW
EXECUTE FUNCTION public.check_meeting_booking_rate_limit();