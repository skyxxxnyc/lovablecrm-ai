-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule automation rules execution every 15 minutes
SELECT cron.schedule(
  'execute-automation-rules',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url:='https://adevhdkpbelglaxfjvqr.supabase.co/functions/v1/execute-automation-rules',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZXZoZGtwYmVsZ2xheGZqdnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDQ3MjgsImV4cCI6MjA3NTUyMDcyOH0.HqvMVkBLEzO5DSfrbG1A4l8IaIk-gjmm9neLbyUpewQ"}'::jsonb
  ) as request_id;
  $$
);

-- Create attachments storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for attachments bucket
CREATE POLICY "Users can upload own attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_timeline_user_created 
  ON activity_timeline(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_deals_user_stage 
  ON deals(user_id, stage);

CREATE INDEX IF NOT EXISTS idx_deals_user_expected_close 
  ON deals(user_id, expected_close_date);

CREATE INDEX IF NOT EXISTS idx_tasks_user_status_due 
  ON tasks(user_id, status, due_date);

CREATE INDEX IF NOT EXISTS idx_contacts_user_updated 
  ON contacts(user_id, updated_at DESC);

-- Enable realtime for activity_timeline
ALTER PUBLICATION supabase_realtime ADD TABLE activity_timeline;