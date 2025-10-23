import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Clock, MessageSquare, Brain, Zap, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { AIDemoChat } from "@/components/landing/AIDemoChat";

const ConversionLanding = () => {
  const [spotsRemaining, setSpotsRemaining] = useState(73);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Sticky Urgency Banner */}
      <div className="sticky top-0 z-50 bg-primary text-primary-foreground py-3 px-4 text-center text-sm md:text-base font-medium border-b border-primary-foreground/20">
        🔥 Launch Special: 50% Off Lifetime | $24.99/month (reg. $49.99) | {spotsRemaining} of 100 spots remaining | Locks when timer hits zero
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Meet Sia, Your AI-Powered CRM Assistant
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Built for freelancers, consultants, and lean teams, Sia helps you stay effortlessly connected with your clients. From smart follow-ups to real-time conversation tracking, Sia handles the busywork so you can focus on deep work. It's not just a tool — it's your second brain for customer relationships.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="text-lg px-8">
              Start Free - No Credit Card Required <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-muted-foreground mb-4">
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Free forever tier available</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Setup in 5 minutes</span>
            </div>
          </div>
          
          <p className="text-sm font-medium text-primary">
            First 100 users: $24.99/month lifetime (50% off $49.99)
          </p>
        </div>
      </section>

      {/* Problem Agitation Section */}
      <section className="container mx-auto px-4 py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            You're Not Bad At Sales. Your Tools Are Working Against You.
          </h2>
          
          <div className="space-y-6 mb-8">
            <p className="text-lg text-muted-foreground">
              Every morning starts the same way. Open six tabs. Check three spreadsheets. Update your pipeline manually. Copy-paste email addresses. Set another reminder you'll ignore. By the time you're done "managing" your relationships, an hour has evaporated.
            </p>
            
            <p className="text-lg text-muted-foreground">
              You've tried the "real" CRMs. Salesforce wanted $75/user/month plus a consultant just to set it up. HubSpot gave you 47 features you'll never use and buried the ones you actually need. You went back to Google Sheets because at least you understand it—even if you're hemorrhaging deals through the cracks.
            </p>
            
            <p className="text-lg text-muted-foreground">
              Meanwhile, enterprise sales teams get AI assistants that spot hot leads, auto-log every interaction, and predict which deals will close. But those tools cost $2,000+ per year and require a team to operate.
            </p>
          </div>
          
          <Card className="p-8 bg-background">
            <ul className="space-y-4">
              {[
                "30+ minutes daily updating pipelines, logging calls, and hunting for contact details you swore you saved",
                "Deals slipping away because you forgot to follow up, lost track in spreadsheets, or mistimed your outreach",
                "Mobile paralysis - can't update anything meaningful from your phone, so information stays trapped in your head",
                "The guilt tax - knowing you should be more organized but hating every \"solution\" that's actually harder than the problem"
              ].map((pain, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-destructive mt-2 shrink-0" />
                  <span className="text-foreground">{pain}</span>
                </li>
              ))}
            </ul>
          </Card>
          
          <p className="text-lg text-center mt-8 text-muted-foreground italic">
            What if enterprise-grade relationship intelligence just... talked to you like a human?
          </p>
        </div>
      </section>

      {/* Solution Revelation Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Meet Sia: The CRM That Works Like Your Brain Actually Works
          </h2>
          
          <div className="space-y-6 mb-12 text-lg text-muted-foreground">
            <p>
              Sia is the first CRM designed around conversation, not forms. Instead of navigating menus and clicking through tabs, you just tell Sia what happened: "Had a great call with Sarah, she's interested in the Q4 package, following up Tuesday."
            </p>
            
            <p>
              Done. Sia logs the activity, updates the deal stage, sets the reminder, and flags Sarah as a hot lead. All from one sentence.
            </p>
            
            <p>
              We took the AI and relationship intelligence that enterprise teams pay $2,000+/year for and rebuilt it for how freelancers and lean teams actually work—mobile-first, conversation-first, simple-first.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: MessageSquare,
                title: "Your AI Chief of Staff",
                description: "Chat interface handles data entry, pipeline updates, and follow-up reminders through natural conversation. No forms, no training, no \"where do I click?\""
              },
              {
                icon: Brain,
                title: "Relationship Intelligence That Actually Works",
                description: "Hot lead detection, relationship health scoring, and smart suggestions tell you who needs attention and when to reach out—features Salesforce charges thousands for."
              },
              {
                icon: Clock,
                title: "30 Minutes Back Every Day",
                description: "Auto-logging from Gmail and Google Calendar means calls, meetings, and emails get captured automatically. Your timeline fills itself while you focus on closing."
              }
            ].map((feature, idx) => (
              <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>

          <Card className="p-8 bg-muted/50">
            <h3 className="text-2xl font-bold mb-6">How It Works:</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                The AI Chat Assistant isn't a gimmick—it's how you interact with everything. "Show me deals closing this month" returns your revenue forecast. "Who haven't I talked to in 3 weeks?" surfaces relationship gaps. "Schedule a call with Marcus" creates the meeting and sends the link.
              </p>
              <p>
                Voice input means you can update deals from your car between meetings. The one-screen contact view means no tab-hopping to find what you need. The visual pipeline board shows your revenue at a glance, with drag-and-drop simplicity.
              </p>
              <p>
                Everything syncs with the tools you already use—Gmail, Google Calendar, Calendly-style scheduling—so you're not juggling apps or losing information in transfers.
              </p>
              <p className="font-semibold text-foreground">
                Start free. Upgrade when you're ready for AI superpowers.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* AI Demo Section */}
      <section className="container mx-auto px-4 py-24 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Experience Sia in Action
            </h2>
            <p className="text-xl text-muted-foreground">
              Chat with our AI assistant right now — no signup required
            </p>
          </div>
          
          <AIDemoChat />
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="container mx-auto px-4 py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            The Numbers That Matter: Your Time Back
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-8">
              <h3 className="text-xl font-bold mb-4 text-destructive">Without siaCRM</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <div className="font-semibold">45 minutes/day</div>
                    <div className="text-sm text-muted-foreground">CRM data entry and updates</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <div className="font-semibold">20 minutes/day</div>
                    <div className="text-sm text-muted-foreground">Searching for contact info and history</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <div className="font-semibold">15 minutes/day</div>
                    <div className="text-sm text-muted-foreground">Manual follow-up tracking</div>
                  </div>
                </li>
                <li className="pt-4 border-t border-border">
                  <div className="text-2xl font-bold text-destructive">80 minutes/day</div>
                  <div className="text-sm text-muted-foreground">= 27 hours/month lost to admin work</div>
                </li>
              </ul>
            </Card>
            
            <Card className="p-8 bg-primary/5 border-primary/20">
              <h3 className="text-xl font-bold mb-4 text-primary">With siaCRM Pro</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">💬</span>
                  <div>
                    <div className="font-semibold">10 minutes/day</div>
                    <div className="text-sm text-muted-foreground">Just talking to your AI assistant</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <div className="font-semibold">0 minutes</div>
                    <div className="text-sm text-muted-foreground">Auto-logging eliminates search time</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <div className="font-semibold">0 minutes</div>
                    <div className="text-sm text-muted-foreground">Smart suggestions eliminate manual tracking</div>
                  </div>
                </li>
                <li className="pt-4 border-t border-primary/20">
                  <div className="text-2xl font-bold text-primary">30+ minutes saved daily</div>
                  <div className="text-sm text-muted-foreground">= 15+ hours/month back for revenue work</div>
                </li>
              </ul>
            </Card>
          </div>

          <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-2xl font-bold mb-6 text-center">ROI Calculator</h3>
            <div className="space-y-4 text-center">
              <div>
                <p className="text-muted-foreground mb-2">If your time is worth $100/hour (conservative for consultants):</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 my-8">
                <div>
                  <div className="text-3xl font-bold text-primary">$1,500</div>
                  <div className="text-sm text-muted-foreground">Monthly value saved (15 hours)</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">$24.99</div>
                  <div className="text-sm text-muted-foreground">siaCRM Pro cost</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">60X</div>
                  <div className="text-sm text-muted-foreground">Return on investment</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Objection Annihilation Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Everything You're About To Ask
          </h2>
          
          <div className="space-y-8 mb-12">
            <Card className="p-8">
              <h3 className="text-xl font-bold mb-4">Why is this so cheap compared to other CRMs?</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  It's not cheap—it's fair. We're not padding prices to afford enterprise sales teams and VC yacht parties. We built efficient AI architecture and we're targeting freelancers and consultants who've been priced out of tools that actually work.
                </p>
                <p>
                  After 100 early adopters, Pro goes to $49.99/month (still less than HubSpot). Right now? $24.99/month locks in forever if you're one of the first 100.
                </p>
                <p className="font-semibold text-foreground">
                  Plus: 15 hours saved monthly = $1,500+ in recovered time. Even at $50/hour, that's $750 value. The math is laughable.
                </p>
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-bold mb-4">What's the catch with the free tier?</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  No catch. Free tier gets you unlimited contacts, deal pipeline, and basic features—forever. It's genuinely useful if you're just starting or have simple needs.
                </p>
                <p>Pro tier ($24.99/month for first 100 users) unlocks:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>AI Chat Assistant (conversational CRM)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Hot Lead Detection & Relationship Intelligence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Gmail & Google Calendar auto-logging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Workflow automation & email sequences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Voice input & advanced mobile features</span>
                  </li>
                </ul>
                <p className="font-semibold text-foreground">
                  Think of free as "try before you commit." Use it for a week. When you see what the AI can do in Pro, you'll upgrade.
                </p>
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-bold mb-4">How do I know this won't be another complicated tool I abandon?</h3>
              <div className="space-y-3 text-muted-foreground">
                <p className="font-semibold text-foreground">Risk Reversal:</p>
                <p>
                  Start free, zero commitment. No credit card required to start. Set it up (5 minutes), explore the interface, add a few contacts. If it's not immediately clearer than what you're using now, stay on free tier or walk away. No pressure, no charges.
                </p>
                <p>
                  When you're ready for AI features, upgrade to Pro. Cancel anytime, no questions asked. One-click cancellation in settings.
                </p>
                <p className="font-semibold text-foreground">Security Promise:</p>
                <p>
                  Bank-level encryption, SOC 2 compliance pathway, your data stays yours. Export anytime, delete anytime. We don't sell your data or spam you.
                </p>
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-bold mb-4">Why not just use HubSpot/Salesforce/Monday?</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 px-4 font-semibold">Feature</th>
                      <th className="py-3 px-4 font-semibold">HubSpot</th>
                      <th className="py-3 px-4 font-semibold">Salesforce</th>
                      <th className="py-3 px-4 font-semibold text-primary">siaCRM</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border">
                      <td className="py-3 px-4 font-medium">Price</td>
                      <td className="py-3 px-4">$45-120/mo</td>
                      <td className="py-3 px-4">$75+/mo</td>
                      <td className="py-3 px-4 text-primary font-semibold">Free-$24.99/mo</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 px-4 font-medium">AI Features</td>
                      <td className="py-3 px-4">+$50/mo extra</td>
                      <td className="py-3 px-4">Enterprise only</td>
                      <td className="py-3 px-4 text-primary font-semibold">Included in Pro</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 px-4 font-medium">Setup Time</td>
                      <td className="py-3 px-4">Hours/Days</td>
                      <td className="py-3 px-4">Days/Consultant</td>
                      <td className="py-3 px-4 text-primary font-semibold">5 minutes</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 px-4 font-medium">Mobile-First</td>
                      <td className="py-3 px-4">No</td>
                      <td className="py-3 px-4">No</td>
                      <td className="py-3 px-4 text-primary font-semibold">Yes</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Built For</td>
                      <td className="py-3 px-4">Teams</td>
                      <td className="py-3 px-4">Enterprise</td>
                      <td className="py-3 px-4 text-primary font-semibold">Freelancers & Consultants</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
            {[
              {
                q: "What's included in the free tier?",
                a: "Unlimited contacts, visual pipeline board, activity timeline, basic automation, mobile access. Everything you need to get organized. Upgrade to Pro for AI features and auto-logging."
              },
              {
                q: "Does it integrate with [my tool]?",
                a: "Pro tier includes Gmail and Google Calendar sync with auto-logging. Calendly-style scheduling links built-in. More integrations shipping based on user requests."
              },
              {
                q: "What if I have 1,000+ contacts?",
                a: "Unlimited contacts on all plans—free and Pro. The AI handles scale. Search and relationship scoring work the same with 10 contacts or 10,000."
              },
              {
                q: "Can I export my data if I leave?",
                a: "Yes. Instant CSV export of all contacts, deals, and activities anytime. Your data isn't hostage. One-click export in settings."
              },
              {
                q: "What happens if I cancel Pro?",
                a: "You drop back to free tier automatically. Keep all your contacts and deals, lose AI features. Re-upgrade anytime. No penalties, no deleted data."
              },
              {
                q: "Is the $24.99 lifetime pricing real?",
                a: "Yes. First 100 Pro subscribers lock in $24.99/month forever. After that, new subscribers pay $49.99/month. Early adopters save $25/month for life ($300/year)."
              },
              {
                q: "Can I upgrade from free to Pro later?",
                a: "Absolutely. Start free, upgrade when ready. But if you want the $24.99 lifetime rate, lock it in while we're under 100 Pro users—after that, it's $49.99/month."
              }
            ].map((faq, idx) => (
              <Card key={idx} className="p-6">
                <h4 className="text-lg font-semibold mb-2">{faq.q}</h4>
                <p className="text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Conversion Catalyst Finale */}
      <section className="container mx-auto px-4 py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
            ⚡ 50% Off Lifetime - First 100 Users Only
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Your Pipeline Doesn't Have To Be A Second Job
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            The consultants and freelancers winning right now aren't working harder—they're letting AI handle the admin work while they focus on relationships and revenue.
          </p>
          
          <p className="text-lg mb-12">
            Five minutes from now, you could have a CRM that actually works for you.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="p-8 text-left">
              <h3 className="text-2xl font-bold mb-4">Option 1: Start Free</h3>
              <p className="text-muted-foreground mb-6">
                Get organized today. Unlimited contacts, pipeline board, mobile access. Upgrade to AI features when ready.
              </p>
              <Button size="lg" variant="outline" className="w-full">
                Start Free - No Credit Card <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Card>

            <Card className="p-8 text-left bg-primary/5 border-primary/20">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold">Option 2: Lock In Lifetime 50% Off</h3>
                <Badge className="shrink-0">Popular</Badge>
              </div>
              <p className="text-muted-foreground mb-6">
                Get full AI-powered Pro tier for $24.99/month forever. Save $300/year for life.
              </p>
              <Button size="lg" className="w-full">
                Claim $24.99 Lifetime Rate <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Card>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center gap-3">
              <Check className="w-5 h-5 text-primary shrink-0" />
              <span className="text-muted-foreground">Try free tier with zero commitment</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Check className="w-5 h-5 text-primary shrink-0" />
              <span className="text-muted-foreground">Upgrade to Pro anytime. Cancel Pro anytime and keep using free tier</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Check className="w-5 h-5 text-primary shrink-0" />
              <span className="text-muted-foreground">Your data stays yours, always</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold text-primary">
              ⚡ {spotsRemaining} of 100 lifetime discount spots remaining
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              After that, Pro costs $49.99/month for everyone else.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-border">
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 siaCRM. All rights reserved.</p>
          <p className="mt-2">Privacy Policy | Terms of Service | Contact</p>
        </div>
      </footer>

      {/* Sticky Bottom CTA (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 md:hidden z-40">
        <Button size="lg" className="w-full">
          {spotsRemaining} Spots Left - Lock In $24.99 <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ConversionLanding;
