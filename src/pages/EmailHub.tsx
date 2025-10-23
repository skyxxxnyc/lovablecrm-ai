import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Mail, Plus, Send, FileText } from "lucide-react";
import { EmailComposer } from "@/components/email/EmailComposer";
import { EmailTemplates } from "@/components/email/EmailTemplates";
import { EmailTracking } from "@/components/email/EmailTracking";
import ResponsiveLayout from "@/components/mobile/ResponsiveLayout";
import MobileFAB from "@/components/mobile/MobileFAB";
import { useIsMobile } from "@/hooks/use-mobile";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const EmailHub = () => {
  const [showComposer, setShowComposer] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <ResponsiveLayout>
        <div className={isMobile ? "p-0" : "p-6"}>
          {!isMobile && <Breadcrumbs items={[{ label: "Email Hub" }]} />}
          
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Header */}
            <div className={isMobile ? "p-4 border-b border-border" : ""}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={isMobile ? "text-2xl font-bold flex items-center gap-2" : "text-3xl font-bold flex items-center gap-2"}>
                    <Mail className={isMobile ? "h-6 w-6 text-primary" : "h-8 w-8 text-primary"} />
                    Email Hub
                  </h1>
                  {!isMobile && (
                    <p className="text-muted-foreground mt-1">
                      Compose, track, and manage all your emails
                    </p>
                  )}
                </div>
                {!isMobile && (
                  <Button onClick={() => setShowComposer(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    Compose Email
                  </Button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className={isMobile ? "px-4 pb-20" : ""}>
              <Tabs defaultValue="tracking" className="space-y-4 md:space-y-6">
                <TabsList className={isMobile ? "grid grid-cols-2 w-full" : ""}>
                  <TabsTrigger value="tracking" className={isMobile ? "text-xs" : ""}>
                    <Mail className="h-4 w-4 mr-2" />
                    {isMobile ? "Tracking" : "Email Tracking"}
                  </TabsTrigger>
                  <TabsTrigger value="templates" className={isMobile ? "text-xs" : ""}>
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
            </div>
          </div>
        </div>
      </ResponsiveLayout>

      {isMobile && (
        <MobileFAB onNewEmail={() => setShowComposer(true)} />
      )}

      {showComposer && (
        <EmailComposer onClose={() => setShowComposer(false)} />
      )}
    </>
  );
};

export default EmailHub;
