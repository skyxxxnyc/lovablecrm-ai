import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OnboardingProps {
  open: boolean;
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to Your CRM!",
    description: "Let's get you started with a quick tour of the key features.",
    icon: "👋"
  },
  {
    title: "AI-Powered Chat",
    description: "Use natural language to manage contacts, deals, and tasks. Just type what you need!",
    icon: "🤖"
  },
  {
    title: "Smart Workflows",
    description: "Automate your sales process with workflows that trigger on events like new contacts or deal stage changes.",
    icon: "⚡"
  },
  {
    title: "Email Sequences",
    description: "Create automated email drip campaigns to nurture your leads over time.",
    icon: "📧"
  },
  {
    title: "Meeting Scheduling",
    description: "Share booking links with prospects and let them schedule meetings based on your availability.",
    icon: "📅"
  },
  {
    title: "Prompt Library",
    description: "Save your favorite AI prompts and reuse them whenever you need.",
    icon: "📚"
  }
];

export const Onboarding = ({ open, onComplete }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        onboarding_completed: true
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save onboarding progress",
        variant: "destructive",
      });
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <Card className="border-0 shadow-none">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">{step.icon}</div>
              <h2 className="text-2xl font-bold">{step.title}</h2>
              <p className="text-muted-foreground">{step.description}</p>
            </div>

            <div className="flex justify-center gap-2 py-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <div className="flex justify-between gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </Button>
              )}
              <Button
                className={currentStep === 0 ? 'w-full' : 'ml-auto'}
                onClick={handleNext}
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Get Started
                  </>
                ) : (
                  'Next'
                )}
              </Button>
            </div>

            <button
              onClick={handleComplete}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
            >
              Skip tutorial
            </button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};