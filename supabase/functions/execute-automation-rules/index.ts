import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all active automation rules
    const { data: rules, error: rulesError } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('is_active', true);

    if (rulesError) throw rulesError;

    console.log(`Processing ${rules?.length || 0} active automation rules`);

    const results = [];

    for (const rule of rules || []) {
      try {
        const executed = await processAutomationRule(rule, supabase);
        results.push({ ruleId: rule.id, status: 'success', executed });
      } catch (error) {
        console.error(`Error processing rule ${rule.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ ruleId: rule.id, status: 'error', error: errorMessage });
        
        // Log the error
        await supabase.from('automation_execution_logs').insert({
          automation_rule_id: rule.id,
          user_id: rule.user_id,
          status: 'failed',
          error_message: errorMessage,
        });
      }
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Automation execution error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processAutomationRule(rule: any, supabase: any) {
  const { trigger_type, trigger_config, action_type, action_config, user_id } = rule;
  
  let shouldExecute = false;
  let triggerData = null;

  // Check trigger conditions
  switch (trigger_type) {
    case 'deal_stage_change':
      // Check for recent deal stage changes
      const { data: deals } = await supabase
        .from('deals')
        .select('*')
        .eq('user_id', user_id)
        .eq('stage', trigger_config.stage)
        .gte('updated_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());
      
      if (deals && deals.length > 0) {
        shouldExecute = true;
        triggerData = deals[0];
      }
      break;

    case 'task_overdue':
      // Check for overdue tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user_id)
        .eq('status', 'pending')
        .lt('due_date', new Date().toISOString());
      
      if (tasks && tasks.length > 0) {
        shouldExecute = true;
        triggerData = tasks[0];
      }
      break;

    case 'contact_inactive':
      // Check for inactive contacts
      const daysInactive = trigger_config.days || 30;
      const { data: contacts } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user_id)
        .lt('updated_at', new Date(Date.now() - daysInactive * 24 * 60 * 60 * 1000).toISOString());
      
      if (contacts && contacts.length > 0) {
        shouldExecute = true;
        triggerData = contacts[0];
      }
      break;
  }

  if (!shouldExecute) {
    return false;
  }

  // Execute action
  const actionsPerformed = [];
  
  switch (action_type) {
    case 'create_task':
      const { data: newTask, error: taskError } = await supabase
        .from('tasks')
        .insert({
          user_id,
          title: action_config.title || `Follow up on ${triggerData.title || triggerData.first_name}`,
          description: action_config.description,
          priority: action_config.priority || 'medium',
          due_date: action_config.due_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();
      
      if (!taskError) {
        actionsPerformed.push({ action: 'create_task', taskId: newTask.id });
      }
      break;

    case 'send_notification':
      await supabase.from('notifications').insert({
        user_id,
        title: action_config.title || 'Automation Alert',
        message: action_config.message,
        type: 'automation',
      });
      actionsPerformed.push({ action: 'send_notification' });
      break;

    case 'update_deal':
      if (triggerData.id) {
        await supabase
          .from('deals')
          .update({ stage: action_config.new_stage })
          .eq('id', triggerData.id);
        actionsPerformed.push({ action: 'update_deal', dealId: triggerData.id });
      }
      break;
  }

  // Log successful execution
  await supabase.from('automation_execution_logs').insert({
    automation_rule_id: rule.id,
    user_id,
    status: 'success',
    trigger_data: triggerData,
    actions_performed: actionsPerformed,
  });

  return true;
}
