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

    // Process the stream to detect and execute tool calls
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    
    if (!reader) {
      throw new Error('No response body');
    }

    const stream = new ReadableStream({
      async start(controller) {
        let toolCallBuffer = '';
        let isProcessingToolCall = false;
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (!line.trim() || line.startsWith(':')) continue;
              if (!line.startsWith('data: ')) continue;
              
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta;
                
                // Detect tool calls
                if (delta?.tool_calls) {
                  isProcessingToolCall = true;
                  const toolCall = delta.tool_calls[0];
                  
                  if (toolCall.function?.arguments) {
                    toolCallBuffer += toolCall.function.arguments;
                  }
                  
                  // Check if tool call is complete
                  if (toolCall.function?.name && toolCallBuffer) {
                    try {
                      const args = JSON.parse(toolCallBuffer);
                      const result = await executeToolCall(toolCall.function.name, args, userId, supabase);
                      
                      // Send confirmation message
                      const confirmMsg = `data: ${JSON.stringify({
                        choices: [{
                          delta: { content: result.message }
                        }]
                      })}\n\n`;
                      controller.enqueue(encoder.encode(confirmMsg));
                      
                      toolCallBuffer = '';
                      isProcessingToolCall = false;
                    } catch (e: any) {
                      console.error('Tool execution error:', e);
                      const errorMsg = `data: ${JSON.stringify({
                        choices: [{
                          delta: { content: `Error: ${e.message || 'Unknown error'}` }
                        }]
                      })}\n\n`;
                      controller.enqueue(encoder.encode(errorMsg));
                    }
                  }
                } else if (!isProcessingToolCall) {
                  // Regular content, forward it
                  controller.enqueue(value);
                }
              } catch (e) {
                // Not valid JSON, might be partial - forward it
                if (!isProcessingToolCall) {
                  controller.enqueue(value);
                }
              }
            }
          }
          
          controller.close();
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
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

async function executeToolCall(toolName: string, args: any, userId: string, supabase: any) {
  console.log('Executing tool:', toolName, 'with args:', args);
  
  try {
    if (toolName === 'create_contact') {
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          user_id: userId,
          first_name: args.first_name,
          last_name: args.last_name,
          email: args.email || null,
          phone: args.phone || null,
          position: args.position || null,
          notes: args.notes || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        message: `✓ Created contact: ${args.first_name} ${args.last_name}${args.email ? ` (${args.email})` : ''}`
      };
    }
    
    if (toolName === 'create_deal') {
      const { data, error } = await supabase
        .from('deals')
        .insert({
          user_id: userId,
          title: args.title,
          amount: args.amount || 0,
          stage: args.stage || 'lead',
          notes: args.notes || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        message: `✓ Created deal: ${args.title}${args.amount ? ` ($${args.amount.toLocaleString()})` : ''}`
      };
    }
    
    if (toolName === 'create_task') {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          title: args.title,
          description: args.description || null,
          priority: args.priority || 'medium',
          due_date: args.due_date || null,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        message: `✓ Created task: ${args.title}${args.due_date ? ` (due ${new Date(args.due_date).toLocaleDateString()})` : ''}`
      };
    }
    
    throw new Error(`Unknown tool: ${toolName}`);
  } catch (error) {
    console.error('Error executing tool:', error);
    throw error;
  }
}

async function detectIntentAndExecute(message: string, userId: string, supabase: any) {
  const lowerMsg = message.toLowerCase();
  
  // Detect intent to open specific entity detail panel
  const viewPatterns = [
    /(?:show|see|view|open|display)\s+(?:me\s+)?(?:the\s+)?(.+?)(?:'s|s)\s+(?:card|details?|profile|info|information|panel)/i,
    /(?:show|see|view|open|display)\s+(?:details?|card|profile|info)\s+(?:for|of)\s+(.+)/i
  ];
  
  for (const pattern of viewPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const searchTerm = match[1].trim();
      
      // Try to find contact
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, first_name, last_name')
        .eq('user_id', userId)
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .limit(1);
      
      if (contacts && contacts.length > 0) {
        return {
          type: 'open_detail',
          data: { entity_type: 'contact', entity_id: contacts[0].id },
          message: `Opening details for ${contacts[0].first_name} ${contacts[0].last_name}`
        };
      }
      
      // Try to find deal
      const { data: deals } = await supabase
        .from('deals')
        .select('id, title')
        .eq('user_id', userId)
        .ilike('title', `%${searchTerm}%`)
        .limit(1);
      
      if (deals && deals.length > 0) {
        return {
          type: 'open_detail',
          data: { entity_type: 'deal', entity_id: deals[0].id },
          message: `Opening deal: ${deals[0].title}`
        };
      }
      
      // Try to find company
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .eq('user_id', userId)
        .ilike('name', `%${searchTerm}%`)
        .limit(1);
      
      if (companies && companies.length > 0) {
        return {
          type: 'open_detail',
          data: { entity_type: 'company', entity_id: companies[0].id },
          message: `Opening company: ${companies[0].name}`
        };
      }
      
      return {
        message: `I couldn't find any contact, deal, or company matching "${searchTerm}"`
      };
    }
  }
  
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
