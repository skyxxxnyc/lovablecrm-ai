import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  X, 
  Globe, 
  Phone,
  MapPin,
  Edit,
  Trash2,
  Send,
  FileText,
  Users,
  Briefcase,
  ExternalLink
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

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  position: string | null;
}

interface Deal {
  id: string;
  title: string;
  stage: string;
  amount: number | null;
}

const CompanyDetailPanel = ({ companyId, onClose }: CompanyDetailPanelProps) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [newNote, setNewNote] = useState("");
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

    const { data: contactData } = await supabase
      .from('contacts')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    setContacts(contactData || []);

    const { data: dealData } = await supabase
      .from('deals')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    setDeals(dealData || []);
    setLoading(false);
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;

    const { error } = await supabase
      .from('companies')
      .update({ notes: newNote })
      .eq('id', companyId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Note saved successfully",
    });
    
    if (company) {
      setCompany({ ...company, notes: newNote });
    }
    setNewNote("");
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

  if (loading || !company) {
    return (
      <aside className="w-96 border-l border-border bg-card flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </aside>
    );
  }

  return (
    <aside className="w-96 border-l border-border bg-card flex flex-col h-screen animate-slide-in-right">
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

        {company.website && (
          <div className="flex items-center space-x-2 text-sm mb-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <a 
              href={company.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {company.website}
            </a>
          </div>
        )}

        {company.phone && (
          <div className="flex items-center space-x-2 text-sm mb-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{company.phone}</span>
          </div>
        )}

        {company.address && (
          <div className="flex items-center space-x-2 text-sm mb-4">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{company.address}</span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Contacts ({contacts.length})</h3>
            </div>
            {contacts.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No contacts yet</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <Card key={contact.id} className="p-3">
                    <p className="text-sm font-medium">
                      {contact.first_name} {contact.last_name}
                    </p>
                    {contact.position && (
                      <p className="text-xs text-muted-foreground">{contact.position}</p>
                    )}
                    {contact.email && (
                      <p className="text-xs text-muted-foreground">{contact.email}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Briefcase className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Deals ({deals.length})</h3>
            </div>
            {deals.length === 0 ? (
              <Card className="p-8 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No deals yet</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {deals.map((deal) => (
                  <Card key={deal.id} className="p-3">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium">{deal.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{deal.stage}</p>
                    {deal.amount && (
                      <p className="text-xs font-semibold mt-1">
                        ${deal.amount.toLocaleString()}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Notes</h3>
            </div>
            {company.notes && (
              <Card className="p-3 mb-3 bg-secondary/50">
                <p className="text-sm whitespace-pre-wrap">{company.notes}</p>
              </Card>
            )}
            <Card className="p-3">
              <Textarea
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[80px] mb-2 border-0 p-0 focus-visible:ring-0 shadow-none resize-none"
              />
              <Button 
                onClick={handleSaveNote}
                size="sm" 
                className="w-full"
                disabled={!newNote.trim()}
              >
                <Send className="mr-2 h-3 w-3" />
                Save Note
              </Button>
            </Card>
          </div>
        </div>
      </ScrollArea>

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
