import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Mail, 
  Phone, 
  Video, 
  Calendar, 
  FileText, 
  CheckSquare, 
  Briefcase,
  Users,
  TrendingUp,
  Zap
} from "lucide-react";

interface QuickActionsProps {
  entityType: "contact" | "deal" | "company";
  entityId: string;
  onAction: (action: string) => void;
}

export const QuickActions = ({ entityType, entityId, onAction }: QuickActionsProps) => {
  const contactActions = [
    { icon: Mail, label: "Send Email", action: "email", color: "text-blue-500" },
    { icon: Phone, label: "Log Call", action: "call", color: "text-green-500" },
    { icon: Video, label: "Schedule Meeting", action: "meeting", color: "text-purple-500" },
    { icon: Briefcase, label: "Create Deal", action: "create-deal", color: "text-orange-500" },
    { icon: CheckSquare, label: "Add Task", action: "task", color: "text-pink-500" },
    { icon: FileText, label: "Add Note", action: "note", color: "text-yellow-500" },
  ];

  const dealActions = [
    { icon: TrendingUp, label: "Update Stage", action: "update-stage", color: "text-blue-500" },
    { icon: FileText, label: "Send Proposal", action: "proposal", color: "text-purple-500" },
    { icon: CheckSquare, label: "Add Task", action: "task", color: "text-pink-500" },
    { icon: Phone, label: "Log Call", action: "call", color: "text-green-500" },
    { icon: Video, label: "Schedule Meeting", action: "meeting", color: "text-orange-500" },
    { icon: FileText, label: "Add Note", action: "note", color: "text-yellow-500" },
  ];

  const companyActions = [
    { icon: Users, label: "Add Contact", action: "add-contact", color: "text-blue-500" },
    { icon: Briefcase, label: "Create Deal", action: "create-deal", color: "text-orange-500" },
    { icon: Phone, label: "Log Call", action: "call", color: "text-green-500" },
    { icon: Video, label: "Schedule Meeting", action: "meeting", color: "text-purple-500" },
    { icon: FileText, label: "Add Note", action: "note", color: "text-yellow-500" },
  ];

  const actions = 
    entityType === "contact" ? contactActions :
    entityType === "deal" ? dealActions :
    companyActions;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="w-full">
          <Zap className="h-4 w-4 mr-2" />
          Quick Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((item) => (
          <DropdownMenuItem key={item.action} onClick={() => onAction(item.action)}>
            <item.icon className={`h-4 w-4 mr-2 ${item.color}`} />
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
