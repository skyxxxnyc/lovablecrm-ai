-- Reports system tables
CREATE TABLE public.report_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL, -- 'pipeline', 'activity', 'revenue', 'forecast', 'custom'
  config JSONB NOT NULL DEFAULT '{}'::jsonb, -- filters, grouping, fields
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.saved_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_definition_id UUID REFERENCES public.report_definitions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL, -- 'revenue', 'deals', 'activities', 'contacts'
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  period_type TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.kpi_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_date DATE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced workflow tables
CREATE TABLE public.workflow_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'lead_nurture', 'deal_management', 'follow_up'
  trigger_type TEXT NOT NULL,
  trigger_conditions JSONB,
  actions JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.workflow_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  avg_execution_time_ms INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.ab_test_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL REFERENCES public.email_sequences(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  variant_config JSONB NOT NULL,
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.report_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own report definitions"
ON public.report_definitions FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved reports"
ON public.saved_reports FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals"
ON public.goals FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own kpi metrics"
ON public.kpi_metrics FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public workflow templates"
ON public.workflow_templates FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can view workflow metrics for own workflows"
ON public.workflow_metrics FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.workflows
  WHERE workflows.id = workflow_metrics.workflow_id
  AND workflows.user_id = auth.uid()
));

CREATE POLICY "Users can manage AB test variants for own sequences"
ON public.ab_test_variants FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.email_sequences
  WHERE email_sequences.id = ab_test_variants.sequence_id
  AND email_sequences.user_id = auth.uid()
));

-- Indexes
CREATE INDEX idx_report_definitions_user_id ON public.report_definitions(user_id);
CREATE INDEX idx_saved_reports_user_id ON public.saved_reports(user_id);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_period ON public.goals(period_start, period_end);
CREATE INDEX idx_kpi_metrics_user_date ON public.kpi_metrics(user_id, metric_date);
CREATE INDEX idx_workflow_metrics_workflow_id ON public.workflow_metrics(workflow_id);
CREATE INDEX idx_ab_test_variants_sequence_id ON public.ab_test_variants(sequence_id);

-- Triggers
CREATE TRIGGER update_report_definitions_updated_at
BEFORE UPDATE ON public.report_definitions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_metrics_updated_at
BEFORE UPDATE ON public.workflow_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();