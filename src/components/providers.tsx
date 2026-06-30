"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { makeQueryClient } from "@/lib/api/query-client";
import { Toaster } from "@/components/ui/sonner";

/**
 * Global client-side providers. Add future providers (theme, tooltip, etc.)
 * by nesting them here so the whole app gets them in one place.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // useState so the client is created once per app instance (not per render).
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
