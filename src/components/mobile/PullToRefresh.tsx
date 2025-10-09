import { ReactNode, useRef, useState, TouchEvent } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

const PullToRefresh = ({ children, onRefresh, disabled = false }: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const scrollY = useRef(0);
  const isPulling = useRef(false);

  const maxPull = 80;
  const threshold = 60;

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || isRefreshing) return;

    const scrollableParent = findScrollableParent(e.target as HTMLElement);
    if (scrollableParent && scrollableParent.scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
    scrollY.current = scrollableParent?.scrollTop || 0;
    isPulling.current = scrollY.current === 0;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling.current || disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Dampen the pull effect
      const distance = Math.min(diff * 0.5, maxPull);
      setPullDistance(distance);

      // Prevent scrolling when pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current || disabled || isRefreshing) return;

    isPulling.current = false;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const findScrollableParent = (element: HTMLElement): HTMLElement | null => {
    let parent = element.parentElement;
    while (parent) {
      const overflow = window.getComputedStyle(parent).overflowY;
      if (overflow === "auto" || overflow === "scroll") {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  };

  return (
    <div
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center transition-transform",
          "text-primary"
        )}
        style={{
          height: pullDistance,
          transform: `translateY(-${Math.max(0, maxPull - pullDistance)}px)`,
        }}
      >
        <RefreshCw
          className={cn(
            "h-5 w-5 transition-transform",
            isRefreshing && "animate-spin",
            pullDistance >= threshold && !isRefreshing && "rotate-180"
          )}
        />
      </div>

      {/* Content */}
      <div
        className="transition-transform"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
