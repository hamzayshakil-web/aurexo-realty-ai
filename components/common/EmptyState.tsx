import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6 rounded-xl border border-dashed border-border bg-muted/20",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 mb-4">
        <Icon className="h-7 w-7 text-amber-500" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="mt-5 bg-amber-500 hover:bg-amber-600 text-white"
          size="sm"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
