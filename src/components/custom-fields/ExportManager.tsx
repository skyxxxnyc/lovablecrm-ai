import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ExportManager = () => {
  const [entityType, setEntityType] = useState("contacts");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let data: any[] = [];
      let error = null;

      if (entityType === 'contacts') {
        const result = await supabase.from('contacts').select('*').eq('user_id', user.id);
        data = result.data || [];
        error = result.error;
      } else if (entityType === 'companies') {
        const result = await supabase.from('companies').select('*').eq('user_id', user.id);
        data = result.data || [];
        error = result.error;
      } else if (entityType === 'deals') {
        const result = await supabase.from('deals').select('*').eq('user_id', user.id);
        data = result.data || [];
        error = result.error;
      }

      if (error) throw error;

      // Convert to CSV
      if (!data || data.length === 0) {
        toast.error('No data to export');
        return;
      }

      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entityType}-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Export completed');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Data Type</label>
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contacts">Contacts</SelectItem>
              <SelectItem value="companies">Companies</SelectItem>
              <SelectItem value="deals">Deals</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
          <FileSpreadsheet className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <p className="font-medium">CSV Export</p>
            <p className="text-sm text-muted-foreground">
              Export all {entityType} to CSV format
            </p>
          </div>
          <Button onClick={handleExport} disabled={exporting}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
