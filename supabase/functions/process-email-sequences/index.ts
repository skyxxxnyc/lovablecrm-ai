import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Processing email sequences...');

    // Get all active enrollments that are ready to send
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('sequence_enrollments')
      .select('id, sequence_id')
      .eq('status', 'active')
      .lte('next_send_at', new Date().toISOString())
      .limit(50); // Process 50 at a time

    if (enrollmentsError) {
      throw new Error(`Failed to fetch enrollments: ${enrollmentsError.message}`);
    }

    console.log(`Found ${enrollments?.length || 0} enrollments to process`);

    const results = [];

    for (const enrollment of enrollments || []) {
      try {
        // Call send-sequence-email function for each enrollment
        const { data, error } = await supabase.functions.invoke('send-sequence-email', {
          body: { enrollmentId: enrollment.id }
        });

        if (error) {
          console.error(`Failed to process enrollment ${enrollment.id}:`, error);
          results.push({ 
            enrollmentId: enrollment.id, 
            success: false, 
            error: error.message 
          });
        } else {
          console.log(`Successfully processed enrollment ${enrollment.id}`);
          results.push({ 
            enrollmentId: enrollment.id, 
            success: true,
            data 
          });
        }
      } catch (error: any) {
        console.error(`Error processing enrollment ${enrollment.id}:`, error);
        results.push({ 
          enrollmentId: enrollment.id, 
          success: false, 
          error: error.message 
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        processed: enrollments?.length || 0,
        results,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing email sequences:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
