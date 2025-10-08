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
    const { messages, userId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
    
    // Check for structured data queries
    const intentResult = await detectIntentAndExecute(lastUserMessage, userId, supabase);
    
    if (intentResult.data) {
      return new Response(
        JSON.stringify({ 
          type: intentResult.type,
          data: intentResult.data,
          message: intentResult.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get smart suggestions for context
    const { data: suggestions } = await supabase
      .from('chat_suggestions')
      .select('*')
      .eq('user_id', userId)
      .eq('dismissed', false)
      .order('priority', { ascending: false })
      .limit(3);

    const suggestionsContext = suggestions && suggestions.length > 0 
      ? `\n\nCurrent priority items:\n${suggestions.map((s: any) => `- ${s.title}: ${s.description}`).join('\n')}`
      : '';

    const systemPrompt = `You are a helpful CRM assistant. You help users manage their contacts, deals, tasks, and activities.
    
You have access to tools to create and update CRM records. Use them when the user asks to create or update data.

You can help with:
- Creating and updating contacts, deals, companies, and tasks
- Finding and organizing information
- Managing sales pipeline
- Providing insights and suggestions
${suggestionsContext}

Be concise, helpful, and proactive in suggesting actions.`;

    // Define tools for function calling
    const tools = [
      {
        type: "function",
        function: {
          name: "create_contact",
          description: "Create a new contact in the CRM",
          parameters: {
            type: "object",
            properties: {
              first_name: { type: "string" },
              last_name: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
              position: { type: "string" },
              notes: { type: "string" }
            },
            required: ["first_name", "last_name"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_deal",
          description: "Create a new deal in the CRM",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              amount: { type: "number" },
              stage: { type: "string", enum: ["lead", "qualified", "proposal", "negotiation", "won", "lost"] },
              notes: { type: "string" }
            },
            required: ["title"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_task",
          description: "Create a new task",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              priority: { type: "string", enum: ["low", "medium", "high"] },
              due_date: { type: "string" }
            },
            required: ["title"]
          }
        }
      }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        tools,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI gateway error');
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Error in crm-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function detectIntentAndExecute(message: string, userId: string, supabase: any) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('show') && (lowerMsg.includes('contact') || lowerMsg.includes('people'))) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching contacts:', error);
      return { message: 'Error fetching contacts' };
    }
    
    return { 
      type: 'contacts_list', 
      data, 
      message: `Found ${data.length} contact${data.length !== 1 ? 's' : ''}`
    };
  }
  
  if (lowerMsg.includes('show') && lowerMsg.includes('task')) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return { message: 'Error fetching tasks' };
    }
    
    return { 
      type: 'tasks_list', 
      data, 
      message: `Found ${data.length} task${data.length !== 1 ? 's' : ''}`
    };
  }
  
  if (lowerMsg.includes('show') && lowerMsg.includes('deal')) {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching deals:', error);
      return { message: 'Error fetching deals' };
    }
    
    return { 
      type: 'deals_list', 
      data, 
      message: `Found ${data.length} deal${data.length !== 1 ? 's' : ''}`
    };
  }
  
  if (lowerMsg.includes('show') && (lowerMsg.includes('compan') || lowerMsg.includes('organization'))) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching companies:', error);
      return { message: 'Error fetching companies' };
    }
    
    return { 
      type: 'companies_list', 
      data, 
      message: `Found ${data.length} ${data.length !== 1 ? 'companies' : 'company'}`
    };
  }
  
  return {};
}
