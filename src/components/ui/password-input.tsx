"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

/**
 * A password field with a show/hide toggle. Drop-in replacement for <Input>
 * on password fields — forwards all input props and the ref.
 */
const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type">
>(({ className, disabled, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn("pr-10", className)}
        disabled={disabled}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {visible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
