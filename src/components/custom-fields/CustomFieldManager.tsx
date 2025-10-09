import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CustomFieldDialog } from "./CustomFieldDialog";

export const CustomFieldManager = () => {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string>("contacts");

  useEffect(() => {
    fetchFields();
  }, [selectedEntity]);

  const fetchFields = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('custom_fields')
        .select('*')
        .eq('user_id', user.id)
        .eq('entity_type', selectedEntity)
        .order('display_order');

      if (error) throw error;
      setFields(data || []);
    } catch (error) {
      console.error('Error fetching custom fields:', error);
      toast.error('Failed to load custom fields');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_fields')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Field deleted');
      fetchFields();
    } catch (error) {
      console.error('Error deleting field:', error);
      toast.error('Failed to delete field');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={selectedEntity === "contacts" ? "default" : "outline"}
            onClick={() => setSelectedEntity("contacts")}
          >
            Contacts
          </Button>
          <Button
            variant={selectedEntity === "deals" ? "default" : "outline"}
            onClick={() => setSelectedEntity("deals")}
          >
            Deals
          </Button>
          <Button
            variant={selectedEntity === "companies" ? "default" : "outline"}
            onClick={() => setSelectedEntity("companies")}
          >
            Companies
          </Button>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading fields...</div>
      ) : fields.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No custom fields yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add fields to customize your {selectedEntity}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <Card key={field.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{field.field_label}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{field.field_name}</p>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="capitalize">{field.field_type}</Badge>
                    {field.is_required && <Badge variant="secondary">Required</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  {field.default_value && (
                    <span className="text-xs text-muted-foreground">
                      Default: {field.default_value}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(field.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showDialog && (
        <CustomFieldDialog
          entityType={selectedEntity}
          onClose={() => setShowDialog(false)}
          onSuccess={() => {
            setShowDialog(false);
            fetchFields();
          }}
        />
      )}
    </div>
  );
};
