-- Ensure event_contacts junction table exists with proper structure
CREATE TABLE IF NOT EXISTS public.event_contacts (
  event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, contact_id)
);

-- Enable RLS on event_contacts
ALTER TABLE public.event_contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can manage own event contacts" ON public.event_contacts;
DROP POLICY IF EXISTS "Users can view own event contacts" ON public.event_contacts;

-- Users can manage event contacts for their own events
CREATE POLICY "Users can manage own event contacts"
ON public.event_contacts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.calendar_events
    WHERE calendar_events.id = event_contacts.event_id
    AND calendar_events.user_id = auth.uid()
  )
);

-- Add google_calendar_id to calendar_events if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'calendar_events' 
    AND column_name = 'google_calendar_id'
  ) THEN
    ALTER TABLE public.calendar_events ADD COLUMN google_calendar_id TEXT;
  END IF;
END $$;

-- Add sync_status to calendar_events for tracking sync state
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'calendar_events' 
    AND column_name = 'sync_status'
  ) THEN
    ALTER TABLE public.calendar_events ADD COLUMN sync_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- Add last_synced_at to calendar_events
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'calendar_events' 
    AND column_name = 'last_synced_at'
  ) THEN
    ALTER TABLE public.calendar_events ADD COLUMN last_synced_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;