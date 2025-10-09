import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckSquare, TrendingUp, Zap, Webhook } from "lucide-react";

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  trigger_type: string;
  actions: any[];
}

const templates: WorkflowTemplate[] = [
  {
    id: "welcome-email",
    name: "Welcome New Contacts",
    description: "Automatically send a welcome email when a new contact is created",
    category: "Lead Management",
    icon: <Mail className="h-5 w-5" />,
    trigger_type: "contact_created",
    actions: [
      {
        type: "send_email",
        config: {
          template: "Welcome Email",
          content: "Hi {{contact.name}},\n\nWelcome to our CRM! We're excited to have you.\n\nBest regards,\nThe Team"
        }
      }
    ]
  },
  {
    id: "deal-stage-followup",
    name: "Deal Stage Follow-up",
    description: "Create a follow-up task when a deal moves to a new stage",
    category: "Sales Process",
    icon: <TrendingUp className="h-5 w-5" />,
    trigger_type: "deal_stage_changed",
    actions: [
      {
        type: "create_task",
        config: {
          title: "Follow up on deal stage change",
          priority: "high"
        }
      }
    ]
  },
  {
    id: "task-completion-notify",
    name: "Task Completion Notification",
    description: "Send a notification email when a task is completed",
    category: "Task Management",
    icon: <CheckSquare className="h-5 w-5" />,
    trigger_type: "task_completed",
    actions: [
      {
        type: "send_email",
        config: {
          template: "Task Completed",
          content: "Task '{{task.title}}' has been completed successfully."
        }
      }
    ]
  },
  {
    id: "lead-nurturing",
    name: "Lead Nurturing Sequence",
    description: "Multi-step nurturing workflow for new contacts",
    category: "Lead Management",
    icon: <Zap className="h-5 w-5" />,
    trigger_type: "contact_created",
    actions: [
      {
        type: "send_email",
        config: {
          template: "Welcome Email",
          content: "Welcome to our platform! Here's what you need to know..."
        }
      },
      {
        type: "create_task",
        config: {
          title: "Schedule follow-up call with new contact",
          priority: "medium"
        }
      }
    ]
  },
  {
    id: "webhook-integration",
    name: "External System Integration",
    description: "Trigger a webhook to notify external systems of deal changes",
    category: "Integrations",
    icon: <Webhook className="h-5 w-5" />,
    trigger_type: "deal_stage_changed",
    actions: [
      {
        type: "trigger_webhook",
        config: {
          url: "https://your-webhook-url.com/api/notify"
        }
      }
    ]
  }
];

interface WorkflowTemplatesProps {
  onSelectTemplate: (template: WorkflowTemplate) => void;
}

export const WorkflowTemplates = ({ onSelectTemplate }: WorkflowTemplatesProps) => {
  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">{category}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {templates
              .filter(t => t.category === category)
              .map((template, index) => (
                <Card 
                  key={template.id} 
                  className="group hover:shadow-md hover:border-primary/30 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          {template.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base mb-1 group-hover:text-primary transition-colors">
                            {template.name}
                          </CardTitle>
                          <CardDescription className="text-sm line-clamp-2">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {template.actions.length} action{template.actions.length > 1 ? 's' : ''}
                      </Badge>
                      <Button 
                        size="sm" 
                        onClick={() => onSelectTemplate(template)}
                        className="shadow-sm hover:shadow transition-all"
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export { templates };
export type { WorkflowTemplate };
