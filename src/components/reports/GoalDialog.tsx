import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GoalDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const GoalDialog = ({ onClose, onSuccess }: GoalDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    goal_type: "revenue",
    target_value: "",
    period_type: "monthly",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      let periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      if (formData.period_type === 'quarterly') {
        const quarter = Math.floor(now.getMonth() / 3);
        periodEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      } else if (formData.period_type === 'yearly') {
        periodEnd = new Date(now.getFullYear(), 11, 31);
      }

      const { error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          goal_type: formData.goal_type,
          target_value: parseFloat(formData.target_value),
          period_type: formData.period_type,
          period_start: periodStart.toISOString().split('T')[0],
          period_end: periodEnd.toISOString().split('T')[0],
          current_value: 0,
        });

      if (error) throw error;

      toast.success('Goal created successfully');
      onSuccess();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="goal_type">Goal Type</Label>
            <Select
              value={formData.goal_type}
              onValueChange={(value) => setFormData({ ...formData, goal_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="deals">Deals Closed</SelectItem>
                <SelectItem value="activities">Activities</SelectItem>
                <SelectItem value="contacts">New Contacts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="target">Target Value</Label>
            <Input
              id="target"
              type="number"
              value={formData.target_value}
              onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
              placeholder="100000"
              required
            />
          </div>

          <div>
            <Label htmlFor="period">Period</Label>
            <Select
              value={formData.period_type}
              onValueChange={(value) => setFormData({ ...formData, period_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
