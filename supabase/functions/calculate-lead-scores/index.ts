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

    const { entityType, entityId } = await req.json();

    let score = 0;
    const signals: any[] = [];

    if (entityType === 'contact' || !entityType) {
      // Get all contacts for the user
      const { data: contacts } = await supabaseClient
        .from('contacts')
        .select('*, activities(*), tasks(*)')
        .eq('user_id', user.id);

      if (contacts) {
        for (const contact of contacts) {
          if (entityId && contact.id !== entityId) continue;

          let contactScore = 0;
          const contactSignals: any[] = [];

          // Profile completeness (30 pts)
          let completeness = 0;
          if (contact.email) completeness += 10;
          if (contact.phone) completeness += 5;
          if (contact.position) completeness += 5;
          if (contact.company_id) completeness += 10;
          contactScore += completeness;
          contactSignals.push({ type: 'profile_completeness', weight: completeness, max: 30 });

          // Activity frequency (40 pts)
          const activities = contact.activities || [];
          const recentActivities = activities.filter((a: any) => 
            new Date(a.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          );
          const activityScore = Math.min(40, recentActivities.length * 5);
          contactScore += activityScore;
          contactSignals.push({ type: 'activity_frequency', weight: activityScore, max: 40 });

          // Activity recency (20 pts)
          if (activities.length > 0) {
            const lastActivity = new Date(activities[activities.length - 1].created_at);
            const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
            let recencyScore = 0;
            if (daysSinceActivity < 7) recencyScore = 20;
            else if (daysSinceActivity < 14) recencyScore = 15;
            else if (daysSinceActivity < 30) recencyScore = 10;
            else if (daysSinceActivity < 60) recencyScore = 5;
            contactScore += recencyScore;
            contactSignals.push({ type: 'activity_recency', weight: recencyScore, max: 20 });
          }

          // Task completion (10 pts)
          const tasks = contact.tasks || [];
          const completedTasks = tasks.filter((t: any) => t.status === 'completed');
          const taskScore = Math.min(10, completedTasks.length * 2);
          contactScore += taskScore;
          contactSignals.push({ type: 'task_completion', weight: taskScore, max: 10 });

          // Update contact engagement score
          await supabaseClient
            .from('contacts')
            .update({ engagement_score: contactScore })
            .eq('id', contact.id);

          // Upsert lead score
          const { data: existingScore } = await supabaseClient
            .from('lead_scores')
            .select('*')
            .eq('contact_id', contact.id)
            .single();

          const scoreHistory = existingScore?.score_history || [];
          scoreHistory.push({ score: contactScore, timestamp: new Date().toISOString() });

          await supabaseClient
            .from('lead_scores')
            .upsert({
              id: existingScore?.id,
              contact_id: contact.id,
              user_id: user.id,
              score: contactScore,
              signals: contactSignals,
              score_history: scoreHistory.slice(-30), // Keep last 30 entries
              last_calculated_at: new Date().toISOString(),
            });

          // Create notification for hot leads (score > 70)
          if (contactScore > 70 && (!existingScore || existingScore.score <= 70)) {
            await supabaseClient.from('notifications').insert({
              user_id: user.id,
              type: 'hot_lead',
              title: 'Hot Lead Identified',
              message: `${contact.first_name} ${contact.last_name} scored ${contactScore}/100`,
              link: `/contacts/${contact.id}`,
            });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Lead scores calculated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in calculate-lead-scores:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
