import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles, Zap, Mail, Calendar, TrendingUp, BarChart3, Users, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface OnboardingProps {
  open: boolean;
  onComplete: () => void;
}

interface UserInfo {
  full_name: string;
  email: string;
  date_of_birth: string;
  city: string;
  country: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  task_reminders: boolean;
  deal_updates: boolean;
}

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Chat",
    description: "Manage your CRM with natural language - just ask and our AI handles the rest"
  },
  {
    icon: Users,
    title: "Smart Contact Management",
    description: "Track contacts, companies, and deals with AI-powered insights and scoring"
  },
  {
    icon: Mail,
    title: "Email Sequences & Tracking",
    description: "Automated drip campaigns with open, click, and reply tracking"
  },
  {
    icon: Zap,
    title: "Workflows & Automation",
    description: "Automate repetitive tasks and trigger actions based on events"
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Share booking links and sync with Google Calendar effortlessly"
  },
  {
    icon: TrendingUp,
    title: "Pipeline Management",
    description: "Visual pipeline board with deal forecasting and probability scoring"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Real-time dashboards, custom reports, and goal tracking"
  },
  {
    icon: MessageSquare,
    title: "Prompt Library",
    description: "Save and reuse your favorite AI prompts for consistent results"
  }
];

export const Onboarding = ({ open, onComplete }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    full_name: "",
    email: "",
    date_of_birth: "",
    city: "",
    country: ""
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: false,
    task_reminders: true,
    deal_updates: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalSteps = 5; // Info, Notifications, Welcome, Features, Upgrade

  const handleUserInfoChange = (field: keyof UserInfo, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const validateUserInfo = () => {
    if (!userInfo.full_name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return false;
    }
    if (!userInfo.email.trim() || !userInfo.email.includes("@")) {
      toast({
        title: "Valid email required",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (currentStep === 0 && !validateUserInfo()) {
      return;
    }

    if (currentStep === 1) {
      // Save user info and notification settings
      await saveUserData();
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const saveUserData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: userInfo.full_name,
          email: userInfo.email,
          date_of_birth: userInfo.date_of_birth || null,
          city: userInfo.city || null,
          country: userInfo.country || null
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update preferences with notification settings
      const { error: prefError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          push_notifications_enabled: notifications.push_notifications
        });

      if (prefError) throw prefError;

      toast({
        title: "Profile saved",
        description: "Your information has been saved successfully",
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

  const handleComplete = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        onboarding_completed: true
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to complete onboarding",
        variant: "destructive",
      });
      setLoading(false);
    } else {
      onComplete();
    }
  };

  const handleUpgrade = () => {
    handleComplete();
    navigate('/billing');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        // User Info Collection
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-5xl mb-4">👋</div>
              <h2 className="text-2xl font-bold">Welcome! Let's Get Started</h2>
              <p className="text-muted-foreground">Tell us a bit about yourself</p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={userInfo.full_name}
                  onChange={(e) => handleUserInfoChange('full_name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={userInfo.email}
                  onChange={(e) => handleUserInfoChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={userInfo.date_of_birth}
                  onChange={(e) => handleUserInfoChange('date_of_birth', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="New York"
                    value={userInfo.city}
                    onChange={(e) => handleUserInfoChange('city', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="USA"
                    value={userInfo.country}
                    onChange={(e) => handleUserInfoChange('country', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        // Notification Settings
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-5xl mb-4">🔔</div>
              <h2 className="text-2xl font-bold">Notification Preferences</h2>
              <p className="text-muted-foreground">Choose how you want to stay informed</p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="email-notif">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  id="email-notif"
                  checked={notifications.email_notifications}
                  onCheckedChange={(checked) => handleNotificationChange('email_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="push-notif">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get instant alerts in-app</p>
                </div>
                <Switch
                  id="push-notif"
                  checked={notifications.push_notifications}
                  onCheckedChange={(checked) => handleNotificationChange('push_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="task-reminders">Task Reminders</Label>
                  <p className="text-sm text-muted-foreground">Remind me about due tasks</p>
                </div>
                <Switch
                  id="task-reminders"
                  checked={notifications.task_reminders}
                  onCheckedChange={(checked) => handleNotificationChange('task_reminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="deal-updates">Deal Updates</Label>
                  <p className="text-sm text-muted-foreground">Notify me of deal changes</p>
                </div>
                <Switch
                  id="deal-updates"
                  checked={notifications.deal_updates}
                  onCheckedChange={(checked) => handleNotificationChange('deal_updates', checked)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        // Welcome & Feedback
        return (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold">Thank You for Joining!</h2>
              <p className="text-muted-foreground">
                We're excited to have you as part of our community
              </p>
              
              <Badge className="bg-primary text-primary-foreground">
                Pre-Launch Phase
              </Badge>
              
              <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-left">
                <p className="text-sm font-medium">We're hungry for feedback! 🚀</p>
                <p className="text-sm text-muted-foreground">
                  As a pre-launch user, your input is invaluable. Help us build the CRM you've always wanted by sharing your thoughts, suggestions, and ideas.
                </p>
                <p className="text-sm text-muted-foreground">
                  Found a bug? Have a feature request? We'd love to hear from you!
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('mailto:feedback@yourcrm.com', '_blank')}
              >
                📧 Send Us Feedback
              </Button>
            </div>
          </div>
        );

      case 3:
        // Feature Showcase
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Powerful Features at Your Fingertips</h2>
              <p className="text-muted-foreground">Everything you need to close more deals</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 max-h-[400px] overflow-y-auto">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="p-3 border rounded-lg space-y-2 hover:border-primary transition-colors"
                  >
                    <Icon className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 4:
        // Upgrade Offer
        return (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🎁</div>
              <Badge className="bg-primary text-primary-foreground text-lg px-4 py-1">
                🎉 Pre-Launch Special: 50% OFF!
              </Badge>
              <h2 className="text-2xl font-bold">Unlock Full Power</h2>
              <p className="text-muted-foreground">
                Upgrade to Pro and get unlimited access to all features
              </p>

              <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-through">
                    Regular price: $49.99/month per user
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-bold text-primary">$24.99</span>
                    <span className="text-muted-foreground">/month per user</span>
                  </div>
                  <p className="text-sm font-medium text-primary">
                    Save $25/month per user!
                  </p>
                </div>

                <div className="space-y-2 text-left">
                  <p className="text-sm font-semibold">Pro includes:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Unlimited contacts & deals
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      AI-powered insights & automation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Email sequences & tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Advanced analytics & reporting
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Priority support
                    </li>
                  </ul>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleUpgrade}
                >
                  Upgrade Now - 50% OFF
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleComplete}
                  disabled={loading}
                >
                  Continue with Free Plan
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden">
        <Card className="border-0 shadow-none">
          <CardContent className="pt-6 space-y-6">
            {renderStep()}

            <div className="flex justify-center gap-2 py-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {currentStep < totalSteps - 1 && (
              <div className="flex justify-between gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    disabled={loading}
                  >
                    Previous
                  </Button>
                )}
                <Button
                  className={currentStep === 0 ? 'w-full' : 'ml-auto'}
                  onClick={handleNext}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Next"}
                </Button>
              </div>
            )}

            {currentStep < totalSteps - 1 && (
              <button
                onClick={handleComplete}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
                disabled={loading}
              >
                Skip onboarding
              </button>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};