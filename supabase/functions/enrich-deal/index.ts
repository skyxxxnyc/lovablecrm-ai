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

    const { dealId } = await req.json();
    
    const { data: deal } = await supabaseClient
      .from('deals')
      .select('*, contacts(*), companies(*), activities(*)')
      .eq('id', dealId)
      .single();

    if (!deal) throw new Error('Deal not found');

    // Get similar deals for comparison
    const { data: similarDeals } = await supabaseClient
      .from('deals')
      .select('*')
      .eq('user_id', user.id)
      .eq('stage', deal.stage)
      .limit(10);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const prompt = `Analyze this sales deal and provide insights:
    
Deal: ${deal.title}
Stage: ${deal.stage}
Amount: ${deal.amount || 'Not set'}
Probability: ${deal.probability || 0}%
Expected Close: ${deal.expected_close_date || 'Not set'}
Contact: ${deal.contacts ? `${deal.contacts.first_name} ${deal.contacts.last_name}` : 'N/A'}
Company: ${deal.companies?.name || 'N/A'}
Notes: ${deal.notes || 'N/A'}
Activities: ${deal.activities?.length || 0} activities logged

Similar deals in same stage: ${similarDeals?.length || 0} deals with average amount ${
  similarDeals?.reduce((sum: number, d: any) => sum + (d.amount || 0), 0) / (similarDeals?.length || 1)
}

Provide deal enrichment insights:
1. Predict close probability percentage (0-100) based on activities and stage
2. Identify 2-3 risk factors that might prevent closing
3. Suggest next best action to move deal forward
4. Suggest realistic deal amount if not set, based on similar deals
5. Estimate days to close based on similar deals

Return the response as a JSON object with this structure:
{
  "close_probability": 75,
  "risk_factors": ["factor1", "factor2"],
  "next_action": "Specific action recommendation",
  "suggested_amount": 50000,
  "estimated_days_to_close": 30
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
            content: 'You are a CRM sales intelligence AI. Provide structured insights based on deal information. Always return valid JSON with numeric values.' 
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
    console.error('Error in enrich-deal:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
