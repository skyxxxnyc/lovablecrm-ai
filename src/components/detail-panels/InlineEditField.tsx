import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Loader2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineEditFieldProps {
  value: string | number | null;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "url" | "number" | "textarea";
  className?: string;
  displayClassName?: string;
  prefix?: React.ReactNode;
}

export const InlineEditField = ({
  value,
  onSave,
  placeholder = "Click to edit",
  type = "text",
  className,
  displayClassName,
  prefix,
}: InlineEditFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value || ""));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setEditValue(String(value || ""));
  }, [value]);

  const handleSave = async () => {
    if (editValue === String(value || "")) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    setError(false);

    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (err) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(String(value || ""));
    setIsEditing(false);
    setError(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "textarea") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {prefix}
        {type === "textarea" ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className={cn("flex-1", error && "border-destructive")}
          />
        ) : (
          <Input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className={cn("flex-1", error && "border-destructive")}
          />
        )}
        <div className="flex items-center gap-1">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : error ? (
            <X className="h-4 w-4 text-destructive" />
          ) : (
            <Check className="h-4 w-4 text-success" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "flex items-center gap-2 cursor-pointer group hover:bg-accent/50 rounded px-2 py-1 -mx-2 transition-colors",
        !value && "text-muted-foreground",
        displayClassName
      )}
    >
      {prefix}
      <span className="flex-1">
        {value || placeholder}
      </span>
      <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
    </div>
  );
};
