import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactForm } from "./forms/ContactForm";
import { DealForm } from "./forms/DealForm";
import { ActivityForm } from "./forms/ActivityForm";
import { Users, Briefcase, Activity, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NewItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const NewItemDialog = ({ open, onOpenChange, onSuccess }: NewItemDialogProps) => {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    onOpenChange(false);
    if (onSuccess) onSuccess();
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('companies')
      .insert({
        name: companyName,
        user_id: user.id
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create company",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Company created successfully",
    });

    setCompanyName("");
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contact">
              <Users className="h-4 w-4 mr-2" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="company">
              <Building2 className="h-4 w-4 mr-2" />
              Company
            </TabsTrigger>
            <TabsTrigger value="deal">
              <Briefcase className="h-4 w-4 mr-2" />
              Deal
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="contact" className="mt-4">
            <ContactForm
              onSuccess={handleClose}
              onCancel={() => onOpenChange(false)}
            />
          </TabsContent>
          
          <TabsContent value="company" className="mt-4">
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="Acme Inc."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  Create Company
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="deal" className="mt-4">
            <DealForm
              onSuccess={handleClose}
              onCancel={() => onOpenChange(false)}
            />
          </TabsContent>
          
          <TabsContent value="activity" className="mt-4">
            <ActivityForm
              onSuccess={handleClose}
              onCancel={() => onOpenChange(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
