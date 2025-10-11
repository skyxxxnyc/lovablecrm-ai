import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Star, Users, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";

const ConversionLanding = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    // Handle conversion
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section - Phase 7 */}
      <section className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
            <Zap className="w-4 h-4 mr-2 inline" />
            Join 10,000+ businesses already converting
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Transform Visitors Into Customers in 60 Seconds
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stop losing 98% of your traffic. Our proven framework turns skeptical visitors into paying customers using psychology-driven conversion design.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <Button type="submit" size="lg" className="px-8 whitespace-nowrap">
              Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>
          
          <p className="text-sm text-muted-foreground">
            ✓ No credit card required  ✓ 14-day free trial  ✓ Cancel anytime
          </p>
        </div>
      </section>

      {/* Social Proof - Phase 10 */}
      <section className="container mx-auto px-4 py-16 border-y border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">10K+</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">$100M+</div>
            <div className="text-sm text-muted-foreground">Revenue Generated</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">4.9/5</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              Rating
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">98%</div>
            <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
          </div>
        </div>
      </section>

      {/* Problem Section - Phase 8 */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Your Website Is Bleeding Money Every Single Day
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-center">
            You're driving traffic to your site, but something's not working. Visitors land, scroll for 3 seconds, and disappear forever.
          </p>
          
          <Card className="p-8 bg-muted/50">
            <ul className="space-y-4">
              {[
                "Your conversion rate is stuck below 2% while competitors hit 10%+",
                "Every day you lose thousands in potential revenue to bounce rates",
                "Your team spent months building a site that looks good but doesn't sell",
                "You're gambling ad budget on traffic that never converts",
                "Your competitors are stealing customers you worked hard to attract"
              ].map((pain, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-destructive mt-2 shrink-0" />
                  <span className="text-foreground">{pain}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* Solution Section - Phase 9 */}
      <section className="container mx-auto px-4 py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            The Conversion Alchemy Framework
          </h2>
          <p className="text-lg text-muted-foreground mb-12 text-center max-w-2xl mx-auto">
            Stop guessing. Start converting. Our proven 12-phase system reads visitor psychology like a stock ticker and guides them from skepticism to purchase.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Users,
                title: "Audience Psychology Mapping",
                description: "Deep-dive into your customer's mental landscape, decision triggers, and resistance patterns"
              },
              {
                icon: TrendingUp,
                title: "Conversion Architecture",
                description: "Strategic funnel design that anticipates objections and creates micro-commitments"
              },
              {
                icon: Zap,
                title: "Psychology-Driven Copy",
                description: "Headlines and CTAs engineered to trigger action using proven behavioral triggers"
              }
            ].map((feature, idx) => (
              <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>

          <Card className="p-8 bg-background">
            <h3 className="text-2xl font-bold mb-6">What You Get:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "12-Phase conversion framework",
                "Audience psychology mapping",
                "Competitor analysis tools",
                "Headline testing formulas",
                "Objection elimination system",
                "Social proof orchestration",
                "Urgency catalyst templates",
                "A/B testing recommendations"
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Testimonials - Phase 10 */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Real Results From Real Businesses
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "Sarah Chen",
                role: "CEO, TechStart",
                result: "327% increase in conversions",
                quote: "We went from 1.2% to 5.1% conversion rate in just 3 weeks. The psychology-driven approach changed everything."
              },
              {
                name: "Michael Rodriguez",
                role: "Marketing Director, GrowthCo",
                result: "$2.4M additional revenue",
                quote: "The 12-phase framework revealed gaps we never knew existed. Our landing pages now convert like crazy."
              },
              {
                name: "Emily Thompson",
                role: "Founder, ScaleUp",
                result: "68% reduction in bounce rate",
                quote: "Finally, a system that actually works. Visitors are staying longer and buying more. Game changer."
              },
              {
                name: "David Park",
                role: "VP Sales, Enterprise Inc",
                result: "2.8x ROI on ad spend",
                quote: "Every dollar we spend on traffic now generates 2.8x more revenue. The math just works."
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                  <Badge variant="secondary" className="text-primary font-semibold">
                    {testimonial.result}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ - Phase 11 */}
      <section className="container mx-auto px-4 py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Common Questions Answered
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: "How long does it take to see results?",
                a: "Most clients see measurable conversion improvements within 2-3 weeks of implementing the framework. Some see results in days."
              },
              {
                q: "Do I need technical skills?",
                a: "No. The framework is designed for marketers, founders, and business owners. If you can write an email, you can use this system."
              },
              {
                q: "What if it doesn't work for my business?",
                a: "We offer a 60-day money-back guarantee. If you implement the framework and don't see improvement, we'll refund every penny."
              },
              {
                q: "Is this suitable for B2B or just B2C?",
                a: "The psychology works for both. We have case studies from SaaS companies, consultants, e-commerce stores, and service businesses."
              },
              {
                q: "How is this different from hiring a copywriter?",
                a: "You own the system forever. Use it for every landing page, product launch, and campaign without paying hourly rates."
              }
            ].map((faq, idx) => (
              <Card key={idx} className="p-6">
                <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Phase 12 */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <Card className="p-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
              🔥 Limited Time Offer
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Stop Losing Customers Today
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              Join 10,000+ businesses using the Conversion Alchemy Framework. Start your 14-day free trial now and transform your website into a conversion machine.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center gap-3 text-left">
                <Check className="w-5 h-5 text-primary shrink-0" />
                <span>Full access to all 12 phases</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-left">
                <Check className="w-5 h-5 text-primary shrink-0" />
                <span>Bonus: A/B testing templates ($297 value)</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-left">
                <Check className="w-5 h-5 text-primary shrink-0" />
                <span>60-day money-back guarantee</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <Button type="submit" size="lg" className="px-8 whitespace-nowrap">
                Start Free Trial
              </Button>
            </form>
            
            <p className="text-sm text-muted-foreground">
              ⚡ Only 47 spots left at this price
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-border">
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 Conversion Alchemy. All rights reserved.</p>
          <p className="mt-2">Privacy Policy | Terms of Service | Contact</p>
        </div>
      </footer>
    </div>
  );
};

export default ConversionLanding;
