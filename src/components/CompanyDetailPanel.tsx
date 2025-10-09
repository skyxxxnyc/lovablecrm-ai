import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InlineEditField } from "./detail-panels/InlineEditField";
import { ActivityHistory } from "./detail-panels/ActivityHistory";
import { FileAttachment } from "./FileAttachment";
import { RelatedRecords } from "./detail-panels/RelatedRecords";
import { QuickActions } from "./detail-panels/QuickActions";
import { 
  X, 
  Globe, 
  Phone,
  MapPin,
  Edit,
  Trash2,
  Paperclip
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompanyDetailPanelProps {
  companyId: string;
  onClose: () => void;
}

interface Company {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
}

interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

const CompanyDetailPanel = ({ companyId, onClose }: CompanyDetailPanelProps) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    industry: "",
    website: "",
    phone: "",
    address: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanyDetails();
  }, [companyId]);

  const fetchCompanyDetails = async () => {
    setLoading(true);
    
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError) {
      console.error('Error fetching company:', companyError);
      toast({
        title: "Error",
        description: "Failed to load company details",
        variant: "destructive",
      });
      return;
    }

    setCompany(companyData);

    setEditForm({
      name: companyData.name || "",
      industry: companyData.industry || "",
      website: companyData.website || "",
      phone: companyData.phone || "",
      address: companyData.address || "",
    });

    const { data: attachmentData } = await supabase
      .from('attachments')
      .select('*')
      .eq('entity_type', 'company')
      .eq('entity_id', companyId)
      .order('created_at', { ascending: false });

    setAttachments(attachmentData || []);
    setLoading(false);
  };

  const handleEdit = async () => {
    const { error } = await supabase
      .from('companies')
      .update(editForm)
      .eq('id', companyId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update company",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Company updated successfully",
    });

    setShowEditDialog(false);
    fetchCompanyDetails();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this company?')) return;

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Company deleted successfully",
    });
    
    onClose();
  };

  const handleFieldSave = async (field: string, value: string) => {
    const { error } = await supabase
      .from('companies')
      .update({ [field]: value })
      .eq('id', companyId);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to update ${field}`,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Saved",
      description: `${field} updated successfully`,
    });

    if (company) {
      setCompany({ ...company, [field]: value });
    }
  };

  const handleQuickAction = (action: string) => {
    // Handle quick actions like adding contacts, deals, etc.
    toast({
      title: "Coming soon",
      description: "Quick actions will be available soon",
    });
  };

  if (loading || !company) {
    return (
      <aside className="w-96 border-l border-border bg-card flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </aside>
    );
  }

  return (
    <aside className="fixed md:relative inset-0 md:inset-auto md:w-96 border-l border-border bg-card flex flex-col h-screen animate-slide-in-right z-40 md:z-auto">
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-1">{company.name}</h2>
            {company.industry && (
              <p className="text-sm text-muted-foreground">{company.industry}</p>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowEditDialog(true)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <InlineEditField
            value={company.website}
            onSave={(value) => handleFieldSave("website", value)}
            type="url"
            placeholder="Add website"
            prefix={<Globe className="h-4 w-4 text-muted-foreground" />}
          />
          
          <InlineEditField
            value={company.phone}
            onSave={(value) => handleFieldSave("phone", value)}
            type="tel"
            placeholder="Add phone"
            prefix={<Phone className="h-4 w-4 text-muted-foreground" />}
          />

          <InlineEditField
            value={company.address}
            onSave={(value) => handleFieldSave("address", value)}
            placeholder="Add address"
            prefix={<MapPin className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        <QuickActions
          entityType="company"
          entityId={companyId}
          onAction={handleQuickAction}
        />
      </div>

      <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-6 mt-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="related">Related</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="overview" className="p-6 space-y-6 m-0">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Attachments ({attachments.length})</h3>
              </div>
              <FileAttachment
                entityType="company"
                entityId={companyId}
                attachments={attachments}
                onUploadComplete={fetchCompanyDetails}
              />
            </div>

            {company.notes && (
              <div>
                <h3 className="font-semibold mb-3">Notes</h3>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{company.notes}</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="p-6 m-0">
            <ActivityHistory entityType="company" entityId={companyId} />
          </TabsContent>

          <TabsContent value="related" className="p-6 m-0">
            <RelatedRecords entityType="company" entityId={companyId} />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={editForm.industry}
                onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={editForm.website}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>
                Update Company
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
};

export default CompanyDetailPanel;
