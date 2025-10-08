import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Trash2, Download, Upload, Star, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[] | null;
  is_favorite: boolean;
  created_at: string;
}

const PromptLibrary = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', category: '', tags: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchPrompts();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchPrompts = async () => {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load prompts",
        variant: "destructive",
      });
    } else {
      setPrompts(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    const { error } = await supabase
      .from('prompts')
      .insert({
        user_id: user.id,
        title: formData.title,
        content: formData.content,
        category: formData.category || null,
        tags: tags.length > 0 ? tags : null,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save prompt",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Prompt saved successfully",
      });
      setShowDialog(false);
      setFormData({ title: '', content: '', category: '', tags: '' });
      fetchPrompts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this prompt?')) return;

    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete prompt",
        variant: "destructive",
      });
    } else {
      fetchPrompts();
    }
  };

  const handleToggleFavorite = async (prompt: Prompt) => {
    const { error } = await supabase
      .from('prompts')
      .update({ is_favorite: !prompt.is_favorite })
      .eq('id', prompt.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite",
        variant: "destructive",
      });
    } else {
      fetchPrompts();
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Prompt copied to clipboard",
    });
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(prompts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `prompts-${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Content', 'Category', 'Tags', 'Is Favorite'];
    const rows = prompts.map(p => [
      p.title,
      p.content,
      p.category || '',
      (p.tags || []).join('; '),
      p.is_favorite ? 'Yes' : 'No'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `prompts-${new Date().toISOString()}.csv`;
    link.click();
  };

  const handleExportMarkdown = () => {
    const markdown = prompts.map(p => 
      `# ${p.title}\n\n${p.content}\n\n**Category:** ${p.category || 'None'}\n**Tags:** ${(p.tags || []).join(', ')}\n\n---\n\n`
    ).join('');
    
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `prompts-${new Date().toISOString()}.md`;
    link.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        let importedPrompts: any[] = [];

        if (file.name.endsWith('.json')) {
          importedPrompts = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n');
          const headers = lines[0].split(',');
          importedPrompts = lines.slice(1).map(line => {
            const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
            return {
              title: values[0]?.replace(/"/g, '') || '',
              content: values[1]?.replace(/"/g, '') || '',
              category: values[2]?.replace(/"/g, '') || null,
              tags: values[3]?.replace(/"/g, '').split('; ').filter(Boolean) || null,
              is_favorite: values[4]?.replace(/"/g, '') === 'Yes'
            };
          });
        } else if (file.name.endsWith('.md')) {
          const sections = content.split('---').filter(s => s.trim());
          importedPrompts = sections.map(section => {
            const titleMatch = section.match(/# (.+)/);
            const categoryMatch = section.match(/\*\*Category:\*\* (.+)/);
            const tagsMatch = section.match(/\*\*Tags:\*\* (.+)/);
            const contentMatch = section.match(/# .+\n\n([\s\S]+?)\n\n\*\*/);
            
            return {
              title: titleMatch?.[1] || 'Untitled',
              content: contentMatch?.[1]?.trim() || '',
              category: categoryMatch?.[1] === 'None' ? null : categoryMatch?.[1] || null,
              tags: tagsMatch?.[1]?.split(', ').filter(Boolean) || null,
              is_favorite: false
            };
          });
        }

        const validPrompts = importedPrompts.filter(p => p.title && p.content).map(p => ({
          ...p,
          user_id: user.id
        }));

        if (validPrompts.length > 0) {
          const { error } = await supabase
            .from('prompts')
            .insert(validPrompts);

          if (error) throw error;

          toast({
            title: "Success",
            description: `Imported ${validPrompts.length} prompts`,
          });
          fetchPrompts();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to import prompts",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const filteredPrompts = prompts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Prompt Library</h1>
            <p className="text-muted-foreground">
              Save and organize your favorite AI prompts
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              type="file"
              accept=".json,.csv,.md"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" onClick={handleExportJSON}>
              <Download className="mr-2 h-4 w-4" />
              JSON
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={handleExportMarkdown}>
              <Download className="mr-2 h-4 w-4" />
              Markdown
            </Button>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Prompt
            </Button>
          </div>
        </div>

        <Input
          placeholder="Search prompts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-6"
        />

        <div className="grid gap-4">
          {filteredPrompts.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No prompts yet</p>
            </Card>
          ) : (
            filteredPrompts.map((prompt) => (
              <Card key={prompt.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {prompt.title}
                        {prompt.is_favorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                      </CardTitle>
                      {prompt.category && (
                        <Badge variant="outline" className="mt-2">{prompt.category}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFavorite(prompt)}
                      >
                        <Star className={`h-4 w-4 ${prompt.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(prompt.content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(prompt.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{prompt.content}</p>
                  {prompt.tags && prompt.tags.length > 0 && (
                    <div className="flex gap-2 mt-4">
                      {prompt.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Prompt</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Email Response Template"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Prompt Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                placeholder="Your prompt text..."
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Sales, Support, Marketing"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated, optional)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., email, professional, quick"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Prompt</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromptLibrary;