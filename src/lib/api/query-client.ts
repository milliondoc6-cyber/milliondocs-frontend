import { QueryClient } from "@tanstack/react-query";

/**
 * Single source of truth for QueryClient defaults.
 * Imported by the Providers tree. Tune caching/retry behavior here.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 min: data is "fresh", no refetch on remount
        gcTime: 5 * 60 * 1000, // 5 min: keep unused cache before garbage collection
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
