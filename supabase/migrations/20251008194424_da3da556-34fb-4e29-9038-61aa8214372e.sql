-- Create email sequences table
CREATE TABLE public.email_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sequence steps table
CREATE TABLE public.sequence_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL,
  step_number INTEGER NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  delay_days INTEGER NOT NULL DEFAULT 0,
  delay_hours INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sequence enrollments table
CREATE TABLE public.sequence_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_step INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  paused_at TIMESTAMP WITH TIME ZONE,
  next_send_at TIMESTAMP WITH TIME ZONE
);

-- Create availability slots table for scheduling
CREATE TABLE public.availability_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_sequences
CREATE POLICY "Users can view own sequences"
  ON public.email_sequences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sequences"
  ON public.email_sequences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sequences"
  ON public.email_sequences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sequences"
  ON public.email_sequences FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for sequence_steps
CREATE POLICY "Users can view own sequence steps"
  ON public.sequence_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM email_sequences 
    WHERE email_sequences.id = sequence_steps.sequence_id 
    AND email_sequences.user_id = auth.uid()
  ));

CREATE POLICY "Users can create own sequence steps"
  ON public.sequence_steps FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM email_sequences 
    WHERE email_sequences.id = sequence_steps.sequence_id 
    AND email_sequences.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own sequence steps"
  ON public.sequence_steps FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM email_sequences 
    WHERE email_sequences.id = sequence_steps.sequence_id 
    AND email_sequences.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own sequence steps"
  ON public.sequence_steps FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM email_sequences 
    WHERE email_sequences.id = sequence_steps.sequence_id 
    AND email_sequences.user_id = auth.uid()
  ));

-- RLS Policies for sequence_enrollments
CREATE POLICY "Users can view own enrollments"
  ON public.sequence_enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own enrollments"
  ON public.sequence_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments"
  ON public.sequence_enrollments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own enrollments"
  ON public.sequence_enrollments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for availability_slots
CREATE POLICY "Users can view own availability"
  ON public.availability_slots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own availability"
  ON public.availability_slots FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_sequence_steps_sequence_id ON sequence_steps(sequence_id);
CREATE INDEX idx_sequence_enrollments_contact_id ON sequence_enrollments(contact_id);
CREATE INDEX idx_sequence_enrollments_sequence_id ON sequence_enrollments(sequence_id);
CREATE INDEX idx_sequence_enrollments_next_send ON sequence_enrollments(next_send_at) WHERE status = 'active';
CREATE INDEX idx_availability_slots_user_id ON availability_slots(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_email_sequences_updated_at
  BEFORE UPDATE ON public.email_sequences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();