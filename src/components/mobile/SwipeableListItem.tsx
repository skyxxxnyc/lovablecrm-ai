import { ReactNode, useRef, useState, TouchEvent } from "react";
import { cn } from "@/lib/utils";
import { Trash2, Phone, Mail, Edit } from "lucide-react";

interface SwipeAction {
  icon: typeof Trash2;
  label: string;
  color: string;
  onClick: () => void;
}

interface SwipeableListItemProps {
  children: ReactNode;
  actions?: SwipeAction[];
  onDelete?: () => void;
  onEdit?: () => void;
  onCall?: () => void;
  onEmail?: () => void;
}

const SwipeableListItem = ({
  children,
  actions,
  onDelete,
  onEdit,
  onCall,
  onEmail,
}: SwipeableListItemProps) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  // Default actions if not provided
  const defaultActions: SwipeAction[] = [];
  if (onDelete) {
    defaultActions.push({
      icon: Trash2,
      label: "Delete",
      color: "bg-destructive",
      onClick: onDelete,
    });
  }
  if (onEdit) {
    defaultActions.push({
      icon: Edit,
      label: "Edit",
      color: "bg-blue-500",
      onClick: onEdit,
    });
  }
  if (onCall) {
    defaultActions.push({
      icon: Phone,
      label: "Call",
      color: "bg-green-500",
      onClick: onCall,
    });
  }
  if (onEmail) {
    defaultActions.push({
      icon: Mail,
      label: "Email",
      color: "bg-primary",
      onClick: onEmail,
    });
  }

  const swipeActions = actions || defaultActions;
  const maxSwipe = swipeActions.length * 70;

  const handleTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;

    currentX.current = e.touches[0].clientX;
    const diff = startX.current - currentX.current;

    // Only allow left swipe (diff > 0)
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, maxSwipe));
    } else {
      setSwipeOffset(0);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Snap to full or close
    if (swipeOffset > maxSwipe / 2) {
      setSwipeOffset(maxSwipe);
    } else {
      setSwipeOffset(0);
    }
  };

  const handleActionClick = (action: SwipeAction) => {
    action.onClick();
    setSwipeOffset(0);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Action Buttons (Behind) */}
      <div className="absolute right-0 top-0 bottom-0 flex">
        {swipeActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action)}
            className={cn(
              "w-[70px] flex flex-col items-center justify-center gap-1 text-white transition-transform",
              action.color
            )}
            style={{
              transform: `translateX(${Math.max(0, maxSwipe - swipeOffset)}px)`,
            }}
          >
            <action.icon className="h-5 w-5" />
            <span className="text-xs">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content (Swipeable) */}
      <div
        className={cn(
          "relative bg-card transition-transform touch-pan-y",
          isDragging ? "duration-0" : "duration-300"
        )}
        style={{
          transform: `translateX(-${swipeOffset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableListItem;
