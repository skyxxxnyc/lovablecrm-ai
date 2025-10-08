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
    const { workflowId, triggerData } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      throw new Error('Workflow not found');
    }

    if (!workflow.is_active) {
      throw new Error('Workflow is not active');
    }

    // Create execution record
    const { data: execution, error: executionError } = await supabase
      .from('workflow_executions')
      .insert({
        workflow_id: workflowId,
        user_id: workflow.user_id,
        trigger_data: triggerData,
        status: 'running'
      })
      .select()
      .single();

    if (executionError) {
      throw new Error('Failed to create execution record');
    }

    // Execute actions
    const results = [];
    for (const action of workflow.actions) {
      try {
        const result = await executeAction(action, triggerData, workflow.user_id, supabase);
        results.push({ action: action.type, success: true, result });
      } catch (error: any) {
        results.push({ action: action.type, success: false, error: error.message });
      }
    }

    // Update execution status
    await supabase
      .from('workflow_executions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', execution.id);

    return new Response(
      JSON.stringify({ success: true, execution: execution.id, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Workflow execution error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function executeAction(action: any, triggerData: any, userId: string, supabase: any) {
  const config = action.config || {};

  switch (action.type) {
    case 'send_email':
      return await sendEmail(config, triggerData);
    
    case 'create_task':
      return await createTask(config, triggerData, userId, supabase);
    
    case 'update_field':
      return await updateField(config, triggerData, supabase);
    
    case 'trigger_webhook':
      return await triggerWebhook(config, triggerData);
    
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

async function sendEmail(config: any, triggerData: any) {
  // Get Resend integration
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.log('No Resend API key configured, skipping email');
    return { skipped: true, reason: 'No API key' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.from_email || 'onboarding@resend.dev',
      to: [triggerData.email || 'test@example.com'],
      subject: config.template || 'Notification',
      html: config.content || 'You have a new notification'
    })
  });

  if (!response.ok) {
    throw new Error('Failed to send email');
  }

  return await response.json();
}

async function createTask(config: any, triggerData: any, userId: string, supabase: any) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: config.title || 'Automated Task',
      priority: config.priority || 'medium',
      status: 'pending',
      user_id: userId,
      contact_id: triggerData.contact_id || null,
      deal_id: triggerData.deal_id || null
    });

  if (error) throw error;
  return data;
}

async function updateField(config: any, triggerData: any, supabase: any) {
  if (!config.table || !config.field || !config.value) {
    throw new Error('Missing update configuration');
  }

  const { data, error } = await supabase
    .from(config.table)
    .update({ [config.field]: config.value })
    .eq('id', triggerData.record_id);

  if (error) throw error;
  return data;
}

async function triggerWebhook(config: any, triggerData: any) {
  if (!config.url) {
    throw new Error('Missing webhook URL');
  }

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...triggerData,
      timestamp: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status}`);
  }

  return { status: response.status, sent: true };
}
