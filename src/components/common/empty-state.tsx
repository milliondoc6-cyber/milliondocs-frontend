import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable "no data" state. Use instead of re-writing inline empty blocks in
 * every list page.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6 border border-dashed border-border rounded-xl",
        className
      )}
    >
      {Icon && (
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-3">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
