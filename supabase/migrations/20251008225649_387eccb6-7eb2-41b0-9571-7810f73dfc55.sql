-- Create automation execution logs table
CREATE TABLE public.automation_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_rule_id UUID NOT NULL REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
  trigger_data JSONB,
  actions_performed JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create activity timeline table for unified activity tracking
CREATE TABLE public.activity_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contact', 'deal', 'company', 'task', 'email', 'meeting')),
  entity_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create attachments table for file storage
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contact', 'deal', 'company', 'note')),
  entity_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat suggestions table
CREATE TABLE public.chat_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('overdue_task', 'stuck_deal', 'inactive_contact', 'next_action')),
  entity_type TEXT,
  entity_id UUID,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.automation_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for automation_execution_logs
CREATE POLICY "Users can view own automation logs"
  ON public.automation_execution_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own automation logs"
  ON public.automation_execution_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for activity_timeline
CREATE POLICY "Users can view own activity timeline"
  ON public.activity_timeline FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activity timeline"
  ON public.activity_timeline FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity timeline"
  ON public.activity_timeline FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity timeline"
  ON public.activity_timeline FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for attachments
CREATE POLICY "Users can view own attachments"
  ON public.attachments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own attachments"
  ON public.attachments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own attachments"
  ON public.attachments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for chat_suggestions
CREATE POLICY "Users can view own suggestions"
  ON public.chat_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own suggestions"
  ON public.chat_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_automation_execution_logs_user_id ON public.automation_execution_logs(user_id);
CREATE INDEX idx_automation_execution_logs_automation_rule_id ON public.automation_execution_logs(automation_rule_id);
CREATE INDEX idx_activity_timeline_user_id ON public.activity_timeline(user_id);
CREATE INDEX idx_activity_timeline_entity ON public.activity_timeline(entity_type, entity_id);
CREATE INDEX idx_attachments_user_id ON public.attachments(user_id);
CREATE INDEX idx_attachments_entity ON public.attachments(entity_type, entity_id);
CREATE INDEX idx_chat_suggestions_user_id ON public.chat_suggestions(user_id);
CREATE INDEX idx_chat_suggestions_dismissed ON public.chat_suggestions(dismissed);

-- Function to generate smart suggestions
CREATE OR REPLACE FUNCTION public.generate_smart_suggestions(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clear old suggestions
  DELETE FROM public.chat_suggestions WHERE user_id = p_user_id;
  
  -- Overdue tasks
  INSERT INTO public.chat_suggestions (user_id, suggestion_type, entity_type, entity_id, title, description, priority)
  SELECT 
    p_user_id,
    'overdue_task',
    'task',
    id,
    'Overdue: ' || title,
    'This task was due on ' || due_date::date,
    'high'
  FROM public.tasks
  WHERE user_id = p_user_id 
    AND status = 'pending'
    AND due_date < now()
  LIMIT 5;
  
  -- Stuck deals (no activity in 7 days)
  INSERT INTO public.chat_suggestions (user_id, suggestion_type, entity_type, entity_id, title, description, priority)
  SELECT 
    p_user_id,
    'stuck_deal',
    'deal',
    id,
    'No recent activity: ' || title,
    'This deal has been in ' || stage || ' stage with no updates for over 7 days',
    'high'
  FROM public.deals
  WHERE user_id = p_user_id 
    AND stage NOT IN ('won', 'lost')
    AND updated_at < now() - interval '7 days'
  LIMIT 5;
  
  -- Inactive contacts (no activity in 30 days)
  INSERT INTO public.chat_suggestions (user_id, suggestion_type, entity_type, entity_id, title, description, priority)
  SELECT 
    p_user_id,
    'inactive_contact',
    'contact',
    id,
    'Inactive: ' || first_name || ' ' || last_name,
    'No activity with this contact in over 30 days',
    'medium'
  FROM public.contacts
  WHERE user_id = p_user_id 
    AND updated_at < now() - interval '30 days'
  LIMIT 5;
END;
$$;