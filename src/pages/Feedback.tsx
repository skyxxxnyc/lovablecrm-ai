import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, Lightbulb, Bug, MessageSquare, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const COMING_SOON_FEATURES = [
  {
    title: "Advanced AI Analytics",
    description: "Get deeper insights with AI-powered predictive analytics and forecasting",
    category: "AI",
  },
  {
    title: "Mobile App",
    description: "Native iOS and Android apps for CRM on the go",
    category: "Platform",
  },
  {
    title: "Team Collaboration",
    description: "Real-time collaboration features with shared workspaces and comments",
    category: "Collaboration",
  },
  {
    title: "Custom Integrations API",
    description: "Build your own integrations with our comprehensive API",
    category: "Integration",
  },
  {
    title: "Advanced Workflow Automation",
    description: "Create complex multi-step workflows with conditions and branching",
    category: "Automation",
  },
  {
    title: "Video Conferencing Integration",
    description: "Built-in video calls directly from contact and deal pages",
    category: "Communication",
  },
];

export default function Feedback() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("feedback").insert([{
        user_id: user?.id || null,
        name: formData.name,
        email: formData.email,
        category: formData.category,
        message: formData.message,
      }]);

      if (error) throw error;

      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your input. We'll review it carefully.",
      });

      setFormData({
        name: "",
        email: "",
        category: "",
        message: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <Breadcrumbs items={[{ label: "Feedback & Support" }]} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Feedback & Support</h1>
          <p className="text-muted-foreground mt-2">
            We're in pre-launch and would love to hear from you! Your feedback shapes our product.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Share Your Feedback</CardTitle>
                <CardDescription>
                  Tell us about your experience, report bugs, or suggest features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feature">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Feature Request
                          </div>
                        </SelectItem>
                        <SelectItem value="bug">
                          <div className="flex items-center gap-2">
                            <Bug className="h-4 w-4" />
                            Bug Report
                          </div>
                        </SelectItem>
                        <SelectItem value="feedback">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            General Feedback
                          </div>
                        </SelectItem>
                        <SelectItem value="support">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Support Request
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      placeholder="Tell us more..."
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? "Sending..." : "Submit Feedback"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle>Coming Soon</CardTitle>
                </div>
                <CardDescription>
                  Exciting features we're working on
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {COMING_SOON_FEATURES.map((feature, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-background/60 border border-border/50 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{feature.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {feature.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pre-Launch Special</CardTitle>
                <CardDescription>
                  Help us shape the future of this CRM
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  As an early user, your feedback is invaluable! We're constantly improving based on user input.
                </p>
                <div className="flex flex-col gap-2 p-4 rounded-lg bg-muted">
                  <p className="text-sm font-semibold">Your voice matters:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                    <li>Feature requests are prioritized from user feedback</li>
                    <li>Bug reports help us improve stability</li>
                    <li>General feedback shapes our roadmap</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
