import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { contactId } = await req.json();
    
    const { data: contact } = await supabaseClient
      .from('contacts')
      .select('*, companies(*)')
      .eq('id', contactId)
      .single();

    if (!contact) throw new Error('Contact not found');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const prompt = `Analyze this contact and provide enrichment suggestions:
    
Contact: ${contact.first_name} ${contact.last_name}
Email: ${contact.email || 'N/A'}
Phone: ${contact.phone || 'N/A'}
Position: ${contact.position || 'N/A'}
Company: ${contact.companies?.name || 'N/A'}
Notes: ${contact.notes || 'N/A'}

Provide enrichment suggestions in the following areas:
1. If company is missing and email domain is present, suggest a company name
2. Analyze the job title and suggest job function and seniority level
3. Based on all available information, suggest relevant industry tags
4. Suggest 2-3 relevant tags that describe this contact

Return the response as a JSON object with this structure:
{
  "company_name": "suggested company name or null",
  "job_function": "suggested job function (e.g., Sales, Marketing, Engineering)",
  "seniority": "suggested seniority (e.g., Entry, Mid, Senior, Executive)",
  "industry": "suggested industry category",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are a CRM data enrichment AI. Provide structured suggestions based on available contact information. Always return valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the JSON response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    const enrichments = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return new Response(
      JSON.stringify({ enrichments }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enrich-contact:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
