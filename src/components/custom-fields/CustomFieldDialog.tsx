import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CustomFieldDialogProps {
  entityType: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CustomFieldDialog = ({ entityType, onClose, onSuccess }: CustomFieldDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    field_name: "",
    field_label: "",
    field_type: "text",
    is_required: false,
    default_value: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('custom_fields')
        .insert({
          user_id: user.id,
          entity_type: entityType,
          ...formData,
        });

      if (error) throw error;

      toast.success('Custom field created');
      onSuccess();
    } catch (error) {
      console.error('Error creating field:', error);
      toast.error('Failed to create field');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Custom Field</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="field_label">Field Label</Label>
            <Input
              id="field_label"
              value={formData.field_label}
              onChange={(e) => setFormData({ ...formData, field_label: e.target.value })}
              placeholder="Customer Type"
              required
            />
          </div>

          <div>
            <Label htmlFor="field_name">Field Name (for API)</Label>
            <Input
              id="field_name"
              value={formData.field_name}
              onChange={(e) => setFormData({ ...formData, field_name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              placeholder="customer_type"
              required
            />
          </div>

          <div>
            <Label htmlFor="field_type">Field Type</Label>
            <Select
              value={formData.field_type}
              onValueChange={(value) => setFormData({ ...formData, field_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="select">Dropdown</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="default_value">Default Value (optional)</Label>
            <Input
              id="default_value"
              value={formData.default_value}
              onChange={(e) => setFormData({ ...formData, default_value: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_required"
              checked={formData.is_required}
              onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked as boolean })}
            />
            <Label htmlFor="is_required">Required field</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Field'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
