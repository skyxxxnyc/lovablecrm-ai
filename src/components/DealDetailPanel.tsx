import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { DealForm } from "./forms/DealForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { ActivityForm } from "./forms/ActivityForm";
import { InlineEditField } from "./detail-panels/InlineEditField";
import { ActivityHistory } from "./detail-panels/ActivityHistory";
import { FileAttachment } from "./FileAttachment";
import { RelatedRecords } from "./detail-panels/RelatedRecords";
import { QuickActions } from "./detail-panels/QuickActions";
import { 
  X, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  Paperclip
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DealDetailPanelProps {
  dealId: string;
  onClose: () => void;
}

interface Deal {
  id: string;
  title: string;
  stage: string;
  amount: number | null;
  probability: number | null;
  expected_close_date: string | null;
  notes: string | null;
  contact_id: string | null;
  company_id: string | null;
  contacts?: {
    first_name: string;
    last_name: string;
  };
  companies?: {
    name: string;
  };
}

interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

const stageColors: Record<string, string> = {
  lead: 'bg-gray-500',
  qualified: 'bg-blue-500',
  proposal: 'bg-yellow-500',
  negotiation: 'bg-orange-500',
  closed: 'bg-green-500',
  lost: 'bg-red-500'
};

const DealDetailPanel = ({ dealId, onClose }: DealDetailPanelProps) => {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const DialogWrapper = isMobile ? Drawer : Dialog;
  const DialogContentWrapper = isMobile ? DrawerContent : DialogContent;
  const DialogHeaderWrapper = isMobile ? DrawerHeader : DialogHeader;
  const DialogTitleWrapper = isMobile ? DrawerTitle : DialogTitle;

  useEffect(() => {
    fetchDealDetails();
  }, [dealId]);

  const fetchDealDetails = async () => {
    setLoading(true);
    
    const { data: dealData, error: dealError } = await supabase
      .from('deals')
      .select('*, contacts(first_name, last_name), companies(name)')
      .eq('id', dealId)
      .single();

    if (dealError) {
      console.error('Error fetching deal:', dealError);
      toast({
        title: "Error",
        description: "Failed to load deal details",
        variant: "destructive",
      });
      return;
    }

    setDeal(dealData);

    const { data: attachmentData } = await supabase
      .from('attachments')
      .select('*')
      .eq('entity_type', 'deal')
      .eq('entity_id', dealId)
      .order('created_at', { ascending: false });

    setAttachments(attachmentData || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', dealId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete deal",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Deal deleted successfully",
    });
    
    onClose();
  };

  const handleFieldSave = async (field: string, value: string) => {
    const updateValue = field === 'amount' ? parseFloat(value) : value;
    
    const { error } = await supabase
      .from('deals')
      .update({ [field]: updateValue })
      .eq('id', dealId);

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

    if (deal) {
      setDeal({ ...deal, [field]: updateValue });
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "update-stage":
        setShowEditDialog(true);
        break;
      case "call":
      case "meeting":
      case "note":
      case "task":
        setShowActivityDialog(true);
        break;
    }
  };

  if (loading || !deal) {
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
            <h2 className="text-xl font-semibold mb-2">{deal.title}</h2>
            <Badge className={`${stageColors[deal.stage] || 'bg-gray-500'} text-white mb-2`}>
              {deal.stage}
            </Badge>
            {deal.contacts && (
              <p className="text-sm text-muted-foreground">
                {deal.contacts.first_name} {deal.contacts.last_name}
              </p>
            )}
            {deal.companies && (
              <p className="text-sm text-muted-foreground">{deal.companies.name}</p>
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
            value={deal.amount}
            onSave={(value) => handleFieldSave("amount", value)}
            type="number"
            placeholder="Add amount"
            prefix={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            displayClassName="text-lg font-semibold"
          />

          {deal.probability !== null && (
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>{deal.probability}% probability</span>
            </div>
          )}

          {deal.expected_close_date && (
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Close: {new Date(deal.expected_close_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <QuickActions
          entityType="deal"
          entityId={dealId}
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
                entityType="deal"
                entityId={dealId}
                attachments={attachments}
                onUploadComplete={fetchDealDetails}
              />
            </div>

            {deal.notes && (
              <div>
                <h3 className="font-semibold mb-3">Notes</h3>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{deal.notes}</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="p-6 m-0">
            <ActivityHistory entityType="deal" entityId={dealId} />
          </TabsContent>

          <TabsContent value="related" className="p-6 m-0">
            <RelatedRecords entityType="deal" entityId={dealId} />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <DialogWrapper open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContentWrapper className={isMobile ? "" : "max-w-2xl"}>
          <DialogHeaderWrapper>
            <DialogTitleWrapper>Edit Deal</DialogTitleWrapper>
          </DialogHeaderWrapper>
          <DealForm
            dealId={dealId}
            onSuccess={() => {
              setShowEditDialog(false);
              fetchDealDetails();
            }}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContentWrapper>
      </DialogWrapper>

      <DialogWrapper open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContentWrapper>
          <DialogHeaderWrapper>
            <DialogTitleWrapper>Log Activity</DialogTitleWrapper>
          </DialogHeaderWrapper>
          <ActivityForm
            dealId={dealId}
            onSuccess={() => {
              setShowActivityDialog(false);
              fetchDealDetails();
            }}
            onCancel={() => setShowActivityDialog(false)}
          />
        </DialogContentWrapper>
      </DialogWrapper>
    </aside>
  );
};

export default DealDetailPanel;
