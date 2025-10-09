import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Edit, Tag, Download } from "lucide-react";

interface BulkActionsProps {
  selectedIds: string[];
  entityType: 'contacts' | 'companies' | 'deals';
  onComplete: () => void;
}

export const BulkActions = ({ selectedIds, entityType, onComplete }: BulkActionsProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [action, setAction] = useState<'delete' | 'export' | null>(null);

  const handleBulkDelete = async () => {
    try {
      const { error } = await supabase
        .from(entityType)
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      toast.success(`Deleted ${selectedIds.length} ${entityType}`);
      setShowConfirm(false);
      onComplete();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast.error('Failed to delete items');
    }
  };

  const handleBulkExport = async () => {
    try {
      let data: any[] = [];
      
      if (entityType === 'contacts') {
        const result = await supabase.from('contacts').select('*').in('id', selectedIds);
        data = result.data || [];
      } else if (entityType === 'companies') {
        const result = await supabase.from('companies').select('*').in('id', selectedIds);
        data = result.data || [];
      } else if (entityType === 'deals') {
        const result = await supabase.from('deals').select('*').in('id', selectedIds);
        data = result.data || [];
      }

      if (data.length === 0) {
        toast.error('No data to export');
        return;
      }

      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entityType}-bulk-export.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Export completed');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Export failed');
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary">
        <span className="text-sm font-medium">
          {selectedIds.length} selected
        </span>
        <div className="flex gap-1 ml-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkExport()}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setAction('delete');
              setShowConfirm(true);
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk {action === 'delete' ? 'Delete' : 'Action'}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {action === 'delete' && `Are you sure you want to delete ${selectedIds.length} ${entityType}? This action cannot be undone.`}
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
            >
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
