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

    const { companyId } = await req.json();
    
    const { data: company } = await supabaseClient
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (!company) throw new Error('Company not found');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const prompt = `Analyze this company and provide enrichment suggestions:
    
Company: ${company.name}
Industry: ${company.industry || 'N/A'}
Website: ${company.website || 'N/A'}
Phone: ${company.phone || 'N/A'}
Address: ${company.address || 'N/A'}
Notes: ${company.notes || 'N/A'}

Provide enrichment suggestions in the following areas:
1. If industry is missing or vague, suggest a specific industry category
2. Estimate company size (Small: 1-50, Medium: 51-500, Large: 500+, Enterprise: 5000+)
3. Suggest market segment (B2B, B2C, B2B2C)
4. Identify 2-3 key decision maker roles we should target
5. Suggest relevant tags

Return the response as a JSON object with this structure:
{
  "industry": "specific industry category",
  "company_size": "estimated size category",
  "market_segment": "B2B, B2C, or B2B2C",
  "decision_makers": ["role1", "role2", "role3"],
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
            content: 'You are a CRM data enrichment AI. Provide structured suggestions based on available company information. Always return valid JSON.' 
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
    
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    const enrichments = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return new Response(
      JSON.stringify({ enrichments }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enrich-company:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
