import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // System prompt for CRM operations
    const systemPrompt = `You are an AI assistant for a CRM system. You help users manage contacts, companies, deals, tasks, and activities through natural conversation.

When users ask to create, update, or find CRM entities, you should:
1. Extract key information from their message
2. Respond conversationally
3. Include structured data in your response when creating/updating entities

For creating a contact, include JSON like:
{
  "action": "create_contact",
  "data": {
    "first_name": "...",
    "last_name": "...",
    "email": "...",
    "phone": "...",
    "position": "...",
    "company_name": "..."
  }
}

Be conversational, helpful, and extract as much relevant information as possible from user messages.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    // Try to parse JSON from the response to handle actions
    let contactId = null;
    const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const actionData = JSON.parse(jsonMatch[0]);
        
        if (actionData.action === 'create_contact' && actionData.data) {
          // Create company first if provided
          let companyId = null;
          if (actionData.data.company_name) {
            const { data: companyData, error: companyError } = await supabaseClient
              .from('companies')
              .insert({
                user_id: userId,
                name: actionData.data.company_name
              })
              .select()
              .single();
            
            if (!companyError && companyData) {
              companyId = companyData.id;
            }
          }

          // Create contact
          const { data: contactData, error: contactError } = await supabaseClient
            .from('contacts')
            .insert({
              user_id: userId,
              first_name: actionData.data.first_name,
              last_name: actionData.data.last_name,
              email: actionData.data.email,
              phone: actionData.data.phone,
              position: actionData.data.position,
              company_id: companyId
            })
            .select()
            .single();

          if (!contactError && contactData) {
            contactId = contactData.id;
          }
        }
      } catch (parseError) {
        console.error('Error parsing action JSON:', parseError);
      }
    }

    // Clean the message to remove JSON
    const cleanMessage = assistantMessage.replace(/\{[\s\S]*\}/, '').trim();

    return new Response(
      JSON.stringify({ 
        message: cleanMessage || assistantMessage,
        contactId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in crm-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
