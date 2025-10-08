import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing automation rules...');

    // Get all active automation rules
    const { data: rules, error: rulesError } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('is_active', true);

    if (rulesError) throw rulesError;

    const results = [];

    for (const rule of rules || []) {
      try {
        const tasksCreated = await processRule(rule, supabase);
        results.push({
          rule_id: rule.id,
          rule_name: rule.name,
          tasks_created: tasksCreated
        });
      } catch (error: any) {
        console.error(`Error processing rule ${rule.id}:`, error);
        results.push({
          rule_id: rule.id,
          rule_name: rule.name,
          error: error.message
        });
      }
    }

    console.log('Automation rules processed:', results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing automation rules:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function processRule(rule: any, supabase: any): Promise<number> {
  let tasksCreated = 0;

  switch (rule.trigger_type) {
    case 'meeting_scheduled':
      tasksCreated = await processMeetingTrigger(rule, supabase);
      break;
    
    case 'deal_stage_changed':
      tasksCreated = await processDealStageTrigger(rule, supabase);
      break;
    
    case 'contact_inactive':
      tasksCreated = await processInactivityTrigger(rule, supabase);
      break;
  }

  return tasksCreated;
}

async function processMeetingTrigger(rule: any, supabase: any): Promise<number> {
  const daysDelay = rule.trigger_config.days_delay || 3;
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - daysDelay);
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // Find meetings scheduled exactly X days ago
  const { data: meetings } = await supabase
    .from('scheduled_meetings')
    .select('*, scheduling_links!inner(user_id)')
    .gte('start_time', targetDate.toISOString())
    .lt('start_time', nextDay.toISOString());

  let tasksCreated = 0;

  for (const meeting of meetings || []) {
    // Check if task already exists for this meeting
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('user_id', meeting.scheduling_links.user_id)
      .ilike('title', `%${meeting.attendee_name}%`)
      .gte('created_at', targetDate.toISOString());

    if (!existingTasks || existingTasks.length === 0) {
      // Create follow-up task
      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: meeting.scheduling_links.user_id,
          title: rule.action_config.title.replace('{name}', meeting.attendee_name),
          description: `Follow up from meeting on ${new Date(meeting.start_time).toLocaleDateString()}`,
          priority: rule.action_config.priority,
          status: 'pending',
          due_date: new Date().toISOString()
        });

      if (!error) {
        tasksCreated++;
        
        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: meeting.scheduling_links.user_id,
            title: 'New Task Created',
            message: `Automation rule "${rule.name}" created a follow-up task`,
            type: 'automation',
            link: '/dashboard'
          });
      }
    }
  }

  return tasksCreated;
}

async function processDealStageTrigger(rule: any, supabase: any): Promise<number> {
  const targetStage = rule.trigger_config.stage;
  const checkDate = new Date();
  checkDate.setHours(checkDate.getHours() - 1); // Check deals that changed stage in last hour

  // Find deals in target stage that were recently updated
  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .eq('stage', targetStage)
    .gte('updated_at', checkDate.toISOString());

  let tasksCreated = 0;

  for (const deal of deals || []) {
    // Check if task already exists for this deal stage change
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('user_id', deal.user_id)
      .eq('deal_id', deal.id)
      .ilike('title', `%${rule.action_config.title}%`)
      .gte('created_at', checkDate.toISOString());

    if (!existingTasks || existingTasks.length === 0) {
      // Create task
      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: deal.user_id,
          deal_id: deal.id,
          contact_id: deal.contact_id,
          title: rule.action_config.title.replace('{deal}', deal.title),
          description: `Deal moved to ${targetStage}`,
          priority: rule.action_config.priority,
          status: 'pending',
          due_date: new Date().toISOString()
        });

      if (!error) {
        tasksCreated++;
        
        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: deal.user_id,
            title: 'New Task Created',
            message: `Automation rule "${rule.name}" created a task for ${deal.title}`,
            type: 'automation',
            link: '/dashboard'
          });
      }
    }
  }

  return tasksCreated;
}

async function processInactivityTrigger(rule: any, supabase: any): Promise<number> {
  const daysInactive = rule.trigger_config.days_inactive || 30;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

  // Find contacts with no recent activity
  const { data: contacts } = await supabase
    .from('contacts')
    .select(`
      *,
      activities!left(created_at)
    `)
    .lte('updated_at', cutoffDate.toISOString());

  let tasksCreated = 0;

  for (const contact of contacts || []) {
    // Check if there's been any recent activity
    const hasRecentActivity = contact.activities?.some((a: any) => 
      new Date(a.created_at) > cutoffDate
    );

    if (!hasRecentActivity) {
      // Check if task already exists
      const { data: existingTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', contact.user_id)
        .eq('contact_id', contact.id)
        .ilike('title', `%${rule.action_config.title}%`)
        .gte('created_at', new Date(Date.now() - 86400000).toISOString()); // Last 24h

      if (!existingTasks || existingTasks.length === 0) {
        // Create re-engagement task
        const { error } = await supabase
          .from('tasks')
          .insert({
            user_id: contact.user_id,
            contact_id: contact.id,
            title: rule.action_config.title.replace('{contact}', `${contact.first_name} ${contact.last_name}`),
            description: `Contact has been inactive for ${daysInactive} days`,
            priority: rule.action_config.priority,
            status: 'pending',
            due_date: new Date().toISOString()
          });

        if (!error) {
          tasksCreated++;
          
          // Create notification
          await supabase
            .from('notifications')
            .insert({
              user_id: contact.user_id,
              title: 'New Task Created',
              message: `Automation rule "${rule.name}" created a re-engagement task`,
              type: 'automation',
              link: '/dashboard'
            });
        }
      }
    }
  }

  return tasksCreated;
}