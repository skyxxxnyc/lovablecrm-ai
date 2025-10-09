-- Create lead_scores table
CREATE TABLE public.lead_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  signals JSONB DEFAULT '[]'::jsonb,
  score_history JSONB DEFAULT '[]'::jsonb,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add scoring columns to contacts
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0;

-- Add scoring columns to companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 0;

-- Add scoring columns to deals
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS probability_score INTEGER DEFAULT 0;

-- Enable RLS on lead_scores
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for lead_scores
CREATE POLICY "Users can view own lead scores"
ON public.lead_scores FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lead scores"
ON public.lead_scores FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lead scores"
ON public.lead_scores FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lead scores"
ON public.lead_scores FOR DELETE
USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_lead_scores_contact_id ON public.lead_scores(contact_id);
CREATE INDEX idx_lead_scores_company_id ON public.lead_scores(company_id);
CREATE INDEX idx_lead_scores_deal_id ON public.lead_scores(deal_id);
CREATE INDEX idx_lead_scores_user_id ON public.lead_scores(user_id);
CREATE INDEX idx_lead_scores_score ON public.lead_scores(score DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_lead_scores_updated_at
BEFORE UPDATE ON public.lead_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();