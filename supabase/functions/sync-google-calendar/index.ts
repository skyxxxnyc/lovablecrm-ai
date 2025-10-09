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

    console.log('Starting calendar sync for user:', user.id);

    // Get user's Google tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('gmail_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('Google Calendar not connected');
    }

    // Check if token needs refresh
    let accessToken = tokenData.access_token;
    if (new Date(tokenData.expires_at) <= new Date()) {
      if (!tokenData.refresh_token) {
        throw new Error('Token expired and no refresh token available');
      }
      accessToken = await refreshAccessToken(tokenData.refresh_token);
      
      // Update access token
      await supabase
        .from('gmail_tokens')
        .update({
          access_token: accessToken,
          expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
        })
        .eq('user_id', user.id);
    }

    // Fetch events from Google Calendar (next 30 days)
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!calendarResponse.ok) {
      throw new Error('Failed to fetch Google Calendar events');
    }

    const calendarData = await calendarResponse.json();
    const googleEvents = calendarData.items || [];

    console.log(`Fetched ${googleEvents.length} events from Google Calendar`);

    // Sync events to local database
    let syncedCount = 0;
    for (const event of googleEvents) {
      if (!event.start?.dateTime || !event.end?.dateTime) continue;

      const { error: upsertError } = await supabase
        .from('calendar_events')
        .upsert({
          user_id: user.id,
          google_event_id: event.id,
          google_calendar_id: event.id,
          title: event.summary || 'Untitled Event',
          start_time: event.start.dateTime,
          end_time: event.end.dateTime,
          location: event.location || null,
          meeting_notes: event.description || null,
          sync_status: 'synced',
          last_synced_at: new Date().toISOString(),
        }, {
          onConflict: 'google_event_id',
          ignoreDuplicates: false,
        });

      if (!upsertError) {
        syncedCount++;
      }
    }

    // Push local events to Google Calendar (events without google_event_id)
    const { data: localEvents } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .is('google_event_id', null)
      .eq('sync_status', 'pending');

    let pushedCount = 0;
    if (localEvents) {
      for (const localEvent of localEvents) {
        const googleEvent = {
          summary: localEvent.title,
          start: { dateTime: localEvent.start_time },
          end: { dateTime: localEvent.end_time },
          location: localEvent.location,
          description: localEvent.meeting_notes,
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
            .eq('id', localEvent.id);

          pushedCount++;
        }
      }
    }

    console.log(`Sync complete: ${syncedCount} pulled, ${pushedCount} pushed`);

    return new Response(
      JSON.stringify({ 
        success: true,
        synced_from_google: syncedCount,
        pushed_to_google: pushedCount,
        message: 'Calendar synced successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in sync-google-calendar:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
