-- Fix function search_path issues for security
CREATE OR REPLACE FUNCTION public.generate_smart_suggestions(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;