import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, Webhook, Zap, Trash2, Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Integration {
  id: string;
  integration_type: string;
  name: string;
  config: any;
  is_active: boolean;
  created_at: string;
}

const Integrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState({ name: '', config: {} });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchIntegrations();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchIntegrations = async () => {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load integrations",
        variant: "destructive",
      });
    } else {
      setIntegrations(data || []);
    }
  };

  const handleAddIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('integrations')
      .insert({
        user_id: user.id,
        integration_type: selectedType,
        name: formData.name,
        config: formData.config,
        is_active: true
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add integration",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Integration added successfully",
      });
      setShowAddDialog(false);
      setFormData({ name: '', config: {} });
      fetchIntegrations();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;

    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete integration",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Integration deleted successfully",
      });
      fetchIntegrations();
    }
  };

  const integrationTypes = [
    {
      type: 'lindy',
      icon: Zap,
      title: 'Lindy.io',
      description: 'AI-powered automation with Lindy',
      fields: [
        { key: 'webhook_url', label: 'Lindy Webhook URL', type: 'url' },
        { key: 'api_key', label: 'Lindy API Key (Optional)', type: 'password' }
      ]
    },
    {
      type: 'zapier',
      icon: Zap,
      title: 'Zapier Webhook',
      description: 'Connect to 5000+ apps via Zapier',
      fields: [{ key: 'webhook_url', label: 'Webhook URL', type: 'url' }]
    },
    {
      type: 'email',
      icon: Mail,
      title: 'Email (Resend)',
      description: 'Send automated emails',
      fields: [
        { key: 'api_key', label: 'Resend API Key', type: 'password' },
        { key: 'from_email', label: 'From Email', type: 'email' }
      ]
    },
    {
      type: 'webhook',
      icon: Webhook,
      title: 'Custom Webhook',
      description: 'Trigger custom HTTP webhooks',
      fields: [
        { key: 'webhook_url', label: 'Webhook URL', type: 'url' },
        { key: 'method', label: 'HTTP Method', type: 'select', options: ['POST', 'GET', 'PUT'] }
      ]
    }
  ];

  const getIntegrationIcon = (type: string) => {
    const integration = integrationTypes.find(i => i.type === type);
    return integration?.icon || Settings;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Integrations</h1>
            <p className="text-muted-foreground">
              Connect your CRM with external services
            </p>
          </div>
          <Button onClick={() => navigate('/workflows')}>
            Back to Workflows
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {integrationTypes.map((integration) => {
            const Icon = integration.icon;
            return (
              <Card 
                key={integration.type}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => {
                  setSelectedType(integration.type);
                  setShowAddDialog(true);
                }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-8 w-8 text-primary" />
                    <CardTitle>{integration.title}</CardTitle>
                  </div>
                  <CardDescription>{integration.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Integration
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Integrations</h2>
          {integrations.length === 0 ? (
            <Card className="p-8 text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No integrations configured yet</p>
            </Card>
          ) : (
            integrations.map((integration) => {
              const Icon = getIntegrationIcon(integration.integration_type);
              return (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6" />
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <CardDescription className="capitalize">
                            {integration.integration_type.replace('_', ' ')}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={integration.is_active ? "default" : "secondary"}>
                          {integration.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(integration.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add {integrationTypes.find(i => i.type === selectedType)?.title}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddIntegration} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Integration Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., My Zapier Integration"
              />
            </div>
            
            {integrationTypes
              .find(i => i.type === selectedType)
              ?.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    type={field.type}
                    value={(formData.config as any)[field.key] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      config: { ...formData.config, [field.key]: e.target.value }
                    })}
                    required
                  />
                </div>
              ))}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Integration</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Integrations;
