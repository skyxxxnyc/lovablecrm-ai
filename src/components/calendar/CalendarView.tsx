import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Plus, RefreshCw, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { CreateEventDialog } from "./CreateEventDialog";

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  location?: string;
  meeting_notes?: string;
  sync_status?: string;
  google_calendar_id?: string;
}

export function CalendarView() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  useEffect(() => {
    fetchEvents();
    checkGoogleConnection();
  }, []);

  useEffect(() => {
    if (date) {
      filterEventsByDate(date);
    }
  }, [date, events]);

  const checkGoogleConnection = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data } = await supabase
        .from('gmail_tokens')
        .select('*')
        .eq('user_id', session.session.user.id)
        .single();

      setIsGoogleConnected(!!data);
    } catch (error) {
      console.error('Error checking Google connection:', error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const filterEventsByDate = (selectedDate: Date) => {
    const filtered = events.filter(event => {
      const eventDate = parseISO(event.start_time);
      return eventDate.toDateString() === selectedDate.toDateString();
    });
    setSelectedDateEvents(filtered);
  };

  const handleSync = async () => {
    if (!isGoogleConnected) {
      toast.error('Please connect Google Calendar first');
      return;
    }

    setSyncing(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('sync-google-calendar', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) throw error;

      toast.success(`Synced: ${data.synced_from_google} from Google, ${data.pushed_to_google} to Google`);
      await fetchEvents();
    } catch (error: any) {
      console.error('Error syncing calendar:', error);
      toast.error('Failed to sync with Google Calendar');
    } finally {
      setSyncing(false);
    }
  };

  const getEventDates = () => {
    return events.map(event => parseISO(event.start_time));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Calendar</h2>
        </div>
        <div className="flex gap-2">
          {isGoogleConnected && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync with Google'}
            </Button>
          )}
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={{
                hasEvent: getEventDates(),
              }}
              modifiersStyles={{
                hasEvent: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                },
              }}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading events...</div>
            ) : selectedDateEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No events scheduled for this day
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(parseISO(event.start_time), 'h:mm a')} -{' '}
                            {format(parseISO(event.end_time), 'h:mm a')}
                          </span>
                        </div>
                        {event.location && (
                          <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
                        )}
                        {event.meeting_notes && (
                          <p className="text-sm mt-2">{event.meeting_notes}</p>
                        )}
                      </div>
                      {event.sync_status && (
                        <Badge variant={event.sync_status === 'synced' ? 'default' : 'secondary'}>
                          {event.sync_status === 'synced' ? 'Synced' : 'Pending'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateEventDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onEventCreated={fetchEvents}
      />
    </div>
  );
}
