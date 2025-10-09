import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Mail, Plus, Send, FileText } from "lucide-react";
import { EmailComposer } from "@/components/email/EmailComposer";
import { EmailTemplates } from "@/components/email/EmailTemplates";
import { EmailTracking } from "@/components/email/EmailTracking";

const EmailHub = () => {
  const [showComposer, setShowComposer] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                Email Hub
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Compose, track, and manage all your emails
              </p>
            </div>
            <Button onClick={() => setShowComposer(true)}>
              <Send className="h-4 w-4 mr-2" />
              Compose Email
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        <Tabs defaultValue="tracking" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tracking">
              <Mail className="h-4 w-4 mr-2" />
              Email Tracking
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracking">
            <EmailTracking />
          </TabsContent>

          <TabsContent value="templates">
            <EmailTemplates />
          </TabsContent>
        </Tabs>

        {showComposer && (
          <EmailComposer onClose={() => setShowComposer(false)} />
        )}
      </main>
    </div>
  );
};

export default EmailHub;
