import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { format, addDays, setHours, setMinutes, startOfWeek, isBefore, isAfter } from "date-fns";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface SchedulingLink {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  user_id: string;
}

interface TimeSlot {
  datetime: Date;
  formatted: string;
}

const BookMeeting = () => {
  const { slug } = useParams();
  const [link, setLink] = useState<SchedulingLink | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', notes: '' });
  const [isBooked, setIsBooked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLink();
  }, [slug]);

  useEffect(() => {
    if (link) {
      generateTimeSlots();
    }
  }, [link, selectedDate]);

  const fetchLink = async () => {
    const { data, error } = await supabase
      .from('scheduling_links')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .single();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Scheduling link not found",
        variant: "destructive",
      });
    } else {
      setLink(data);
    }
  };

  const generateTimeSlots = async () => {
    if (!link) return;

    // Get availability for the selected day
    const dayOfWeek = selectedDate.getDay();
    
    const { data: availability, error } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('user_id', link.user_id)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true);

    if (error || !availability || availability.length === 0) {
      setAvailableSlots([]);
      return;
    }

    // Get existing bookings for this day
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: bookings } = await supabase
      .from('scheduled_meetings')
      .select('start_time, end_time')
      .eq('scheduling_link_id', link.id)
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString());

    const bookedTimes = new Set(bookings?.map(b => b.start_time) || []);

    // Generate slots
    const slots: TimeSlot[] = [];
    const now = new Date();

    for (const slot of availability) {
      const [startHour, startMinute] = slot.start_time.split(':').map(Number);
      const [endHour, endMinute] = slot.end_time.split(':').map(Number);
      
      let currentTime = setMinutes(setHours(new Date(selectedDate), startHour), startMinute);
      const endTime = setMinutes(setHours(new Date(selectedDate), endHour), endMinute);

      while (isBefore(currentTime, endTime)) {
        // Check if slot is in the past
        if (isAfter(currentTime, now)) {
          const timeString = currentTime.toISOString();
          
          // Check if slot is already booked
          if (!bookedTimes.has(timeString)) {
            slots.push({
              datetime: new Date(currentTime),
              formatted: format(currentTime, 'h:mm a')
            });
          }
        }

        // Move to next slot
        currentTime = new Date(currentTime.getTime() + link.duration_minutes * 60000);
      }
    }

    setAvailableSlots(slots);
  };

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !link) return;

    const endTime = new Date(selectedSlot.datetime.getTime() + link.duration_minutes * 60000);

    const { error } = await supabase
      .from('scheduled_meetings')
      .insert({
        scheduling_link_id: link.id,
        attendee_name: formData.name,
        attendee_email: formData.email,
        notes: formData.notes,
        start_time: selectedSlot.datetime.toISOString(),
        end_time: endTime.toISOString(),
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to book meeting",
        variant: "destructive",
      });
    } else {
      setIsBooked(true);
      toast({
        title: "Meeting Booked!",
        description: "You'll receive a confirmation email shortly",
      });
    }
  };

  if (!link) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isBooked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Meeting Booked!</h2>
            <p className="text-muted-foreground">
              Your meeting is confirmed for {selectedSlot && format(selectedSlot.datetime, 'PPPP')} at {selectedSlot?.formatted}
            </p>
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to {formData.email}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Book Meeting</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              {link.title}
            </CardTitle>
            <CardDescription>{link.description}</CardDescription>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {link.duration_minutes} minutes
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div>
                <h3 className="font-semibold mb-4">Select a Date</h3>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 14 }, (_, i) => {
                    const date = addDays(new Date(), i);
                    const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                    return (
                      <Button
                        key={i}
                        variant={isSelected ? "default" : "outline"}
                        className="h-auto flex-col p-2"
                        onClick={() => setSelectedDate(date)}
                      >
                        <span className="text-xs">{format(date, 'EEE')}</span>
                        <span className="font-bold">{format(date, 'd')}</span>
                      </Button>
                    );
                  })}
                </div>

                {/* Time Slots */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-4">
                    Available Times - {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                    {availableSlots.length === 0 ? (
                      <p className="col-span-2 text-sm text-muted-foreground text-center py-4">
                        No available times for this date
                      </p>
                    ) : (
                      availableSlots.map((slot, index) => (
                        <Button
                          key={index}
                          variant={selectedSlot?.formatted === slot.formatted ? "default" : "outline"}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {slot.formatted}
                        </Button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div>
                <h3 className="font-semibold mb-4">Your Information</h3>
                <form onSubmit={handleBookMeeting} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Anything you'd like to share?"
                      rows={3}
                    />
                  </div>

                  {selectedSlot && (
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium mb-1">Selected Time:</p>
                      <p className="text-sm">
                        {format(selectedSlot.datetime, 'PPPP')} at {selectedSlot.formatted}
                      </p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={!selectedSlot}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Meeting
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookMeeting;