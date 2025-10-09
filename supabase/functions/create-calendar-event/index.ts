import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { title, start_time, end_time, location, meeting_notes, contact_ids } = await req.json();

    if (!title || !start_time || !end_time) {
      throw new Error('Title, start_time, and end_time are required');
    }

    console.log('Creating calendar event for user:', user.id);

    // Create event in local database
    const { data: eventData, error: eventError } = await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        title,
        start_time,
        end_time,
        location: location || null,
        meeting_notes: meeting_notes || null,
        sync_status: 'pending',
      })
      .select()
      .single();

    if (eventError || !eventData) {
      throw new Error('Failed to create event in database');
    }

    // Link contacts to event
    if (contact_ids && contact_ids.length > 0) {
      const eventContacts = contact_ids.map((contactId: string) => ({
        event_id: eventData.id,
        contact_id: contactId,
      }));

      await supabase
        .from('event_contacts')
        .insert(eventContacts);
    }

    // Try to sync to Google Calendar
    try {
      const { data: tokenData } = await supabase
        .from('gmail_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (tokenData) {
        let accessToken = tokenData.access_token;

        // Check if token needs refresh
        if (new Date(tokenData.expires_at) <= new Date()) {
          if (tokenData.refresh_token) {
            accessToken = await refreshAccessToken(tokenData.refresh_token);
            
            await supabase
              .from('gmail_tokens')
              .update({
                access_token: accessToken,
                expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
              })
              .eq('user_id', user.id);
          }
        }

        // Create event in Google Calendar
        const googleEvent = {
          summary: title,
          start: { dateTime: start_time },
          end: { dateTime: end_time },
          location: location || undefined,
          description: meeting_notes || undefined,
        };

        const createResponse = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(googleEvent),
          }
        );

        if (createResponse.ok) {
          const createdEvent = await createResponse.json();
          
          await supabase
            .from('calendar_events')
            .update({
              google_event_id: createdEvent.id,
              google_calendar_id: createdEvent.id,
              sync_status: 'synced',
              last_synced_at: new Date().toISOString(),
            })
            .eq('id', eventData.id);

          console.log('Event synced to Google Calendar');
        }
      }
    } catch (syncError) {
      console.log('Could not sync to Google Calendar:', syncError);
      // Event is still created locally, just not synced
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        event: eventData,
        message: 'Calendar event created successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in create-calendar-event:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
