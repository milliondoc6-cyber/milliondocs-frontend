import { apiClient } from "./client";

/**
 * Document Sets — the catalog of document templates a user can pick from
 * (e.g. "Bill of Lading", "Commercial Invoice"). Backed by the deployed
 * `/document-set` endpoints.
 *
 * NOTE: the backend stores the catalog only; it has no endpoint to attach a
 * chosen set to a specific shipment/master file yet, so per-shipment selection
 * is tracked client-side (see lib/data/shipment-store.ts).
 */

export interface DocumentSetResponse {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentSetListParams {
  search?: string;
  active_only?: boolean;
  limit?: number;
  offset?: number;
}

function toQuery(params?: DocumentSetListParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.active_only !== undefined) q.set("active_only", String(params.active_only));
  if (params.limit !== undefined) q.set("limit", String(params.limit));
  if (params.offset !== undefined) q.set("offset", String(params.offset));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const documentSetsApi = {
  list: (params?: DocumentSetListParams) =>
    apiClient.get<DocumentSetResponse[]>(`/document-set${toQuery(params)}`),

  /** Batch-create document sets by name. */
  create: (names: string[]) =>
    apiClient.post<DocumentSetResponse[]>("/document-set", { names }),

  get: (id: string) => apiClient.get<DocumentSetResponse>(`/document-set/${id}`),

  update: (id: string, patch: { name?: string; is_active?: boolean }) =>
    apiClient.patch<DocumentSetResponse>(`/document-set/${id}`, patch),

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/document-set/${id}`),
};
