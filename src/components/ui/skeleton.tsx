import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading content"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Common skeleton patterns for better UX
export const CardSkeleton = () => (
  <div className="glass-card rounded-lg p-6 space-y-4">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3" role="status" aria-label="Loading table data">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 items-center">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
);

export const ListSkeleton = ({ items = 3 }: { items?: number }) => (
  <div className="space-y-4" role="status" aria-label="Loading list">
    {Array.from({ length: items }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export { Skeleton };
