import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Upload, Download } from "lucide-react";
import { CustomFieldManager } from "@/components/custom-fields/CustomFieldManager";
import { ImportWizard } from "@/components/custom-fields/ImportWizard";
import { ExportManager } from "@/components/custom-fields/ExportManager";

const CustomFields = () => {
  const [showImport, setShowImport] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                Custom Fields & Data Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Customize fields, import/export data
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowImport(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        <Tabs defaultValue="fields" className="space-y-6">
          <TabsList>
            <TabsTrigger value="fields">
              <Settings className="h-4 w-4 mr-2" />
              Custom Fields
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fields">
            <CustomFieldManager />
          </TabsContent>

          <TabsContent value="export">
            <ExportManager />
          </TabsContent>
        </Tabs>

        {showImport && (
          <ImportWizard onClose={() => setShowImport(false)} />
        )}
      </main>
    </div>
  );
};

export default CustomFields;
