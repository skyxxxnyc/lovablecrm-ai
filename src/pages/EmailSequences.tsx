import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, Plus, Trash2, Edit, Play, Pause, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface EmailSequence {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface SequenceStep {
  id: string;
  step_number: number;
  subject: string;
  body: string;
  delay_days: number;
  delay_hours: number;
}

const EmailSequences = () => {
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStepsDialog, setShowStepsDialog] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<EmailSequence | null>(null);
  const [steps, setSteps] = useState<SequenceStep[]>([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [stepForm, setStepForm] = useState({ 
    subject: '', 
    body: '', 
    delay_days: 0, 
    delay_hours: 0 
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchSequences();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchSequences = async () => {
    const { data, error } = await supabase
      .from('email_sequences')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load sequences",
        variant: "destructive",
      });
    } else {
      setSequences(data || []);
    }
  };

  const fetchSteps = async (sequenceId: string) => {
    const { data, error } = await supabase
      .from('sequence_steps')
      .select('*')
      .eq('sequence_id', sequenceId)
      .order('step_number', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load steps",
        variant: "destructive",
      });
    } else {
      setSteps(data || []);
    }
  };

  const handleCreateSequence = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('email_sequences')
      .insert({
        user_id: user.id,
        name: formData.name,
        description: formData.description,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create sequence",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Sequence created successfully",
      });
      setShowCreateDialog(false);
      setFormData({ name: '', description: '' });
      fetchSequences();
    }
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSequence) return;

    const nextStepNumber = steps.length + 1;

    const { error } = await supabase
      .from('sequence_steps')
      .insert({
        sequence_id: selectedSequence.id,
        step_number: nextStepNumber,
        subject: stepForm.subject,
        body: stepForm.body,
        delay_days: stepForm.delay_days,
        delay_hours: stepForm.delay_hours,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add step",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Step added successfully",
      });
      setStepForm({ subject: '', body: '', delay_days: 0, delay_hours: 0 });
      fetchSteps(selectedSequence.id);
    }
  };

  const handleToggleActive = async (sequence: EmailSequence) => {
    const { error } = await supabase
      .from('email_sequences')
      .update({ is_active: !sequence.is_active })
      .eq('id', sequence.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update sequence",
        variant: "destructive",
      });
    } else {
      fetchSequences();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sequence?')) return;

    const { error } = await supabase
      .from('email_sequences')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete sequence",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Sequence deleted successfully",
      });
      fetchSequences();
    }
  };

  const openStepsDialog = (sequence: EmailSequence) => {
    setSelectedSequence(sequence);
    fetchSteps(sequence.id);
    setShowStepsDialog(true);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Email Sequences</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Email Sequences</h1>
            <p className="text-muted-foreground">
              Create automated email drip campaigns for your contacts
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Sequence
          </Button>
        </div>

        <div className="grid gap-6">
          {sequences.length === 0 ? (
            <Card className="p-8 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No email sequences yet</p>
            </Card>
          ) : (
            sequences.map((sequence) => (
              <Card key={sequence.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        <Mail className="h-5 w-5" />
                        {sequence.name}
                        <Badge variant={sequence.is_active ? "default" : "secondary"}>
                          {sequence.is_active ? 'Active' : 'Paused'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{sequence.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleToggleActive(sequence)}
                      >
                        {sequence.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openStepsDialog(sequence)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(sequence.id)}
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

      {/* Create Sequence Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Email Sequence</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSequence} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Sequence Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Welcome Series"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this sequence for?"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Sequence</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Steps Dialog */}
      <Dialog open={showStepsDialog} onOpenChange={setShowStepsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Sequence Steps - {selectedSequence?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Existing Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <Card key={step.id}>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Step {step.step_number} - Send after {step.delay_days}d {step.delay_hours}h
                    </CardTitle>
                    <CardDescription className="font-semibold">{step.subject}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{step.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add New Step Form */}
            <form onSubmit={handleAddStep} className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Add New Step</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delay_days">Delay (Days)</Label>
                  <Input
                    id="delay_days"
                    type="number"
                    min="0"
                    value={stepForm.delay_days}
                    onChange={(e) => setStepForm({ ...stepForm, delay_days: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delay_hours">Delay (Hours)</Label>
                  <Input
                    id="delay_hours"
                    type="number"
                    min="0"
                    max="23"
                    value={stepForm.delay_hours}
                    onChange={(e) => setStepForm({ ...stepForm, delay_hours: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={stepForm.subject}
                  onChange={(e) => setStepForm({ ...stepForm, subject: e.target.value })}
                  required
                  placeholder="Subject line"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  value={stepForm.body}
                  onChange={(e) => setStepForm({ ...stepForm, body: e.target.value })}
                  required
                  placeholder="Email content... Use {{first_name}}, {{last_name}}, {{email}} for personalization"
                  rows={6}
                />
              </div>

              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailSequences;
