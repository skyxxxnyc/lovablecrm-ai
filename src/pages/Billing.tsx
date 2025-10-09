import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Badge } from "@/components/ui/badge";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Get started with essential CRM features",
    price: 0,
    interval: "month",
    features: [
      "Up to 100 contacts",
      "Basic CRM features",
      "Email integration",
      "Mobile app access",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Full-featured CRM for growing teams",
    price: 24.99,
    interval: "month per user",
    popular: true,
    features: [
      "Unlimited contacts",
      "Advanced CRM features",
      "AI-powered insights",
      "Custom workflows",
      "Priority support",
      "Advanced analytics",
      "Email sequences",
      "Calendar integration",
    ],
  },
];

export default function Billing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      // TODO: Fetch current subscription status from Stripe
      setLoading(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setProcessingPlan(planId);
      
      // TODO: Call Stripe API to create checkout session
      // For now, just show a toast
      toast({
        title: "Coming Soon",
        description: "Stripe checkout will be integrated here to process your subscription.",
      });

      setProcessingPlan(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <Breadcrumbs items={[{ label: "Billing" }]} />
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        <Breadcrumbs items={[{ label: "Billing" }]} />
        
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Choose Your Plan</h1>
            <p className="text-muted-foreground text-lg">
              Select the perfect plan for your business needs
            </p>
            <Badge className="mt-2 bg-primary text-primary-foreground">
              🎉 Pre-Launch Special: 50% OFF - Limited Time!
            </Badge>
            <p className="text-sm text-muted-foreground">
              Regular price: $49.99/month per user
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? "border-primary shadow-lg scale-105"
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-bold">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/{plan.interval}</span>
                        <div className="mt-1">
                          <span className="text-sm text-muted-foreground line-through">
                            $49.99/month per user
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={processingPlan === plan.id || plan.id === "free"}
                  >
                    {processingPlan === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : plan.id === "free" ? (
                      "Current Plan"
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Get Started
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Need a custom solution?</CardTitle>
              <CardDescription>
                Contact our sales team for enterprise pricing and custom features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
