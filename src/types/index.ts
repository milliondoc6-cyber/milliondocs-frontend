/**
 * Globally shared types only. Feature-specific types live in
 * `features/<feature>/types.ts` (or are inferred from that feature's zod schema).
 */

/** Standard paginated list envelope returned by the backend. */
export interface Paginated<T> {
  page: number;
  page_size: number;
  total: number;
  items: T[];
}

export type ID = string; // backend UUIDs
