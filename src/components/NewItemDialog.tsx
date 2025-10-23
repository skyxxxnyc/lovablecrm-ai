import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactForm } from "./forms/ContactForm";
import { DealForm } from "./forms/DealForm";
import { ActivityForm } from "./forms/ActivityForm";
import { CompanyForm } from "./forms/CompanyForm";
import { Users, Briefcase, Activity, Building2 } from "lucide-react";

interface NewItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const NewItemDialog = ({ open, onOpenChange, onSuccess }: NewItemDialogProps) => {
  const handleClose = () => {
    onOpenChange(false);
    if (onSuccess) onSuccess();
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
            <CompanyForm
              onSuccess={handleClose}
              onCancel={() => onOpenChange(false)}
            />
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
