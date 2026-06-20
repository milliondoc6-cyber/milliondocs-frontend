/**
 * Centralized TanStack Query key factory.
 *
 * Why: magic-string keys like `["contacts"]` re-typed in every component drift
 * apart and break cache invalidation. Define them ONCE here so a mutation can
 * do `invalidateQueries({ queryKey: queryKeys.contacts.all })` and refresh
 * every contacts query reliably.
 *
 * Convention (hierarchical): all -> lists() -> list(filters) / detail(id).
 * Invalidating a parent key invalidates all its children.
 */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  contacts: {
    all: ["contacts"] as const,
    lists: () => [...queryKeys.contacts.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.contacts.lists(), filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.contacts.all, "detail", id] as const,
  },
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.products.lists(), filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.products.all, "detail", id] as const,
  },
  shipments: {
    all: ["shipments"] as const,
    lists: () => [...queryKeys.shipments.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.shipments.lists(), filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.shipments.all, "detail", id] as const,
  },
} as const;
