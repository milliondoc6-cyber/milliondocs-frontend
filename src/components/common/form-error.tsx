import { AlertCircle } from "lucide-react";

/**
 * A form-level error banner for server/network failures that aren't tied to a
 * single field (e.g. "Invalid email or password", "Can't reach the server").
 * Renders nothing when there's no message.
 */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
