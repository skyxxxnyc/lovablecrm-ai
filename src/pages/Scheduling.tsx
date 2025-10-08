import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Trash2, Copy, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SchedulingLink {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration_minutes: number;
  active: boolean;
}

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Scheduling = () => {
  const [links, setLinks] = useState<SchedulingLink[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [linkForm, setLinkForm] = useState({ 
    title: '', 
    slug: '', 
    description: '', 
    duration_minutes: 30 
  });
  const [slotForm, setSlotForm] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00'
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchLinks();
    fetchAvailability();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from('scheduling_links')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load scheduling links",
        variant: "destructive",
      });
    } else {
      setLinks(data || []);
    }
  };

  const fetchAvailability = async () => {
    const { data, error } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('is_active', true)
      .order('day_of_week', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load availability",
        variant: "destructive",
      });
    } else {
      setAvailability(data || []);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('scheduling_links')
      .insert({
        user_id: user.id,
        ...linkForm,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create scheduling link",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Scheduling link created successfully",
      });
      setShowLinkDialog(false);
      setLinkForm({ title: '', slug: '', description: '', duration_minutes: 30 });
      fetchLinks();
    }
  };

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('availability_slots')
      .insert({
        user_id: user.id,
        ...slotForm,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add availability slot",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Availability slot added successfully",
      });
      setSlotForm({ day_of_week: 1, start_time: '09:00', end_time: '17:00' });
      fetchAvailability();
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Scheduling link copied to clipboard",
    });
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Delete this scheduling link?')) return;

    const { error } = await supabase
      .from('scheduling_links')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      });
    } else {
      fetchLinks();
    }
  };

  const handleDeleteSlot = async (id: string) => {
    const { error } = await supabase
      .from('availability_slots')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete slot",
        variant: "destructive",
      });
    } else {
      fetchAvailability();
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Meeting Scheduling</h1>
            <p className="text-muted-foreground">
              Create booking links and manage your availability
            </p>
          </div>
        </div>

        {/* Availability Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Your Availability
                </CardTitle>
                <CardDescription>Set your regular weekly availability</CardDescription>
              </div>
              <Button onClick={() => setShowAvailabilityDialog(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Time Slot
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {availability.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No availability set. Add your first time slot to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {availability.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{daysOfWeek[slot.day_of_week]}</span>
                      <span className="text-muted-foreground ml-4">
                        {slot.start_time} - {slot.end_time}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSlot(slot.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduling Links Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Scheduling Links</h2>
          <Button onClick={() => setShowLinkDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Link
          </Button>
        </div>

        <div className="grid gap-4">
          {links.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No scheduling links yet</p>
            </Card>
          ) : (
            links.map((link) => (
              <Card key={link.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-3">
                        {link.title}
                        <Badge variant={link.active ? "default" : "secondary"}>
                          {link.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{link.description}</CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{link.duration_minutes} minutes</span>
                      </div>
                      <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                        {window.location.origin}/book/{link.slug}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopyLink(link.slug)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteLink(link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Scheduling Link</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateLink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                value={linkForm.title}
                onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                required
                placeholder="e.g., 30-Minute Consultation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={linkForm.slug}
                onChange={(e) => setLinkForm({ ...linkForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                required
                placeholder="consultation"
              />
              <p className="text-xs text-muted-foreground">
                Your link will be: {window.location.origin}/book/{linkForm.slug || 'your-slug'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select
                value={linkForm.duration_minutes.toString()}
                onValueChange={(value) => setLinkForm({ ...linkForm, duration_minutes: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={linkForm.description}
                onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })}
                placeholder="What will you discuss?"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowLinkDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Link</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Availability Dialog */}
      <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Availability Slot</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAvailability} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="day">Day of Week</Label>
              <Select
                value={slotForm.day_of_week.toString()}
                onValueChange={(value) => setSlotForm({ ...slotForm, day_of_week: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={slotForm.start_time}
                  onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={slotForm.end_time}
                  onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAvailabilityDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Slot</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Scheduling;