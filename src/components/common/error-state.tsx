import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Reusable error block for failed data loads. Pair with TanStack Query's
 * `error` + `refetch`: <ErrorState message={error.message} onRetry={refetch} />
 */
export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-4",
        className
      )}
    >
      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {message && <p className="text-xs mt-0.5 text-destructive/80">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
