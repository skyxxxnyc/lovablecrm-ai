import { useState } from "react";
import { Plus, X, UserPlus, Briefcase, Building2, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface MobileFABProps {
  onNewContact?: () => void;
  onNewDeal?: () => void;
  onNewCompany?: () => void;
  onNewEvent?: () => void;
  onNewTask?: () => void;
}

const MobileFAB = ({ onNewContact, onNewDeal, onNewCompany, onNewEvent, onNewTask }: MobileFABProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: UserPlus,
      label: "Contact",
      onClick: onNewContact,
      color: "bg-primary hover:bg-primary/90",
    },
    {
      icon: Briefcase,
      label: "Deal",
      onClick: onNewDeal,
      color: "bg-accent hover:bg-accent/90",
    },
    {
      icon: Building2,
      label: "Company",
      onClick: onNewCompany,
      color: "bg-secondary hover:bg-secondary/90",
    },
    {
      icon: Calendar,
      label: "Event",
      onClick: onNewEvent,
      color: "bg-muted hover:bg-muted/90",
    },
    {
      icon: CheckCircle2,
      label: "Task",
      onClick: onNewTask,
      color: "bg-primary hover:bg-primary/90",
    },
  ];

  const handleActionClick = (action: typeof actions[0]) => {
    if (action.onClick) {
      action.onClick();
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action Buttons */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col-reverse gap-3 md:hidden">
        {isOpen &&
          actions.map((action, index) => (
            <div
              key={index}
              className="flex items-center gap-3 animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="bg-card border border-border px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                {action.label}
              </span>
              <Button
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg",
                  action.color
                )}
                onClick={() => handleActionClick(action)}
              >
                <action.icon className="h-5 w-5 text-white" />
              </Button>
            </div>
          ))}

        {/* Main FAB */}
        <Button
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg self-end transition-transform",
            isOpen ? "rotate-45 bg-destructive hover:bg-destructive" : "bg-primary hover:bg-primary/90"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-primary-foreground" />
          ) : (
            <Plus className="h-6 w-6 text-primary-foreground" />
          )}
        </Button>
      </div>
    </>
  );
};

export default MobileFAB;
