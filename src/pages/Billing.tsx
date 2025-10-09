import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, CreditCard, Loader2, Settings } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { useSubscription, SUBSCRIPTION_PLANS } from "@/contexts/SubscriptionContext";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  popular?: boolean;
  priceId?: string;
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
    priceId: SUBSCRIPTION_PLANS.pro.price_id,
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
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const { isPro, loading: subLoading, refreshSubscription } = useSubscription();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Check for success/cancel params after redirect from Stripe
    if (searchParams.get('success') === 'true') {
      toast({
        title: "Success!",
        description: "Your subscription has been activated.",
      });
      refreshSubscription();
    } else if (searchParams.get('canceled') === 'true') {
      toast({
        title: "Checkout Canceled",
        description: "Your subscription checkout was canceled.",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
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

  const handleSubscribe = async (planId: string, priceId?: string) => {
    if (planId === "free") return;
    
    try {
      setProcessingPlan(planId);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to subscribe.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Open the Stripe payment link
      window.open('https://buy.stripe.com/3cIeVfgfjaAGaFpcZVds402', '_blank');

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

  const handleManageSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to manage your subscription.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading || subLoading) {
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
            <Badge variant="outline" className="mt-2 border-primary text-primary">
              🎉 First 100 users lock in $24.99/month for life
            </Badge>
            {isPro && (
              <Badge className="mt-2 bg-primary text-primary-foreground">
                ✓ Pro Plan Active
              </Badge>
            )}
          </div>

          {isPro && (
            <div className="flex justify-center">
              <Button onClick={handleManageSubscription} variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => {
              const isCurrentPlan = (plan.id === "free" && !isPro) || (plan.id === "pro" && isPro);
              
              return (
                <Card
                  key={plan.id}
                  className={`relative ${
                    plan.popular
                      ? "border-primary shadow-lg scale-105"
                      : "border-border"
                  } ${isCurrentPlan ? "border-green-500 border-2" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute -top-4 right-4">
                      <Badge className="bg-green-500 text-white">
                        Your Plan
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
                      onClick={() => handleSubscribe(plan.id, plan.priceId)}
                      disabled={processingPlan === plan.id || isCurrentPlan}
                    >
                      {processingPlan === plan.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrentPlan ? (
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
              );
            })}
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
