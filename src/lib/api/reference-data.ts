import { apiClient } from "./client";

/**
 * Reference data drives the shipment form dropdowns:
 *   - generic reference items keyed by `category` (incoterm, dispatch_method,
 *     shipment_type, pre_carriage_by, …)
 *   - countries
 *   - ports (scoped to a country)
 */

export interface ReferenceDataResponse {
  id: string; // UUID
  category: string;
  item: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CountryResponse {
  id: string; // UUID
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortResponse {
  id: string; // UUID
  country_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ListReferenceItemsParams {
  search?: string;
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}

interface ListCountriesParams {
  search?: string;
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}

interface ListPortsParams {
  search?: string;
  countryId?: string;
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const referenceDataApi = {
  // ── Generic reference items (by category) ─────────────────────────────────
  items: {
    list: (category: string, params: ListReferenceItemsParams = {}) =>
      apiClient.get<ReferenceDataResponse[]>(
        `/reference-data/${encodeURIComponent(category)}/items${buildQuery({
          search: params.search,
          active_only: params.activeOnly,
          limit: params.limit,
          offset: params.offset,
        })}`
      ),
    create: (category: string, items: string[]) =>
      apiClient.post<ReferenceDataResponse[]>(
        `/reference-data/${encodeURIComponent(category)}/items`,
        { items }
      ),
    update: (
      category: string,
      referenceId: string,
      payload: { item?: string; is_active?: boolean }
    ) =>
      apiClient.patch<ReferenceDataResponse>(
        `/reference-data/${encodeURIComponent(category)}/items/${referenceId}`,
        payload
      ),
    delete: (category: string, referenceId: string) =>
      apiClient.delete<{ message: string }>(
        `/reference-data/${encodeURIComponent(category)}/items/${referenceId}`
      ),
  },

  // ── Countries ─────────────────────────────────────────────────────────────
  countries: {
    list: (params: ListCountriesParams = {}) =>
      apiClient.get<CountryResponse[]>(
        `/countries${buildQuery({
          search: params.search,
          active_only: params.activeOnly,
          limit: params.limit,
          offset: params.offset,
        })}`
      ),
    search: (q: string, limit = 20) =>
      apiClient.get<CountryResponse[]>(
        `/countries/search${buildQuery({ q, limit })}`
      ),
    create: (names: string[]) =>
      apiClient.post<CountryResponse[]>("/countries", { names }),
    update: (id: string, payload: { name?: string; is_active?: boolean }) =>
      apiClient.patch<CountryResponse>(`/countries/${id}`, payload),
    delete: (id: string) =>
      apiClient.delete<{ message: string }>(`/countries/${id}`),
  },

  // ── Ports ───────────────────────────────────────────────────────────────--
  ports: {
    list: (params: ListPortsParams = {}) =>
      apiClient.get<PortResponse[]>(
        `/ports${buildQuery({
          search: params.search,
          country_id: params.countryId,
          active_only: params.activeOnly,
          limit: params.limit,
          offset: params.offset,
        })}`
      ),
    search: (q: string, countryId?: string, limit = 20) =>
      apiClient.get<PortResponse[]>(
        `/ports/search${buildQuery({ q, country_id: countryId, limit })}`
      ),
    create: (countryId: string, names: string[]) =>
      apiClient.post<PortResponse[]>("/ports", {
        country_id: countryId,
        names,
      }),
    update: (
      id: string,
      payload: { name?: string; country_id?: string; is_active?: boolean }
    ) => apiClient.patch<PortResponse>(`/ports/${id}`, payload),
    delete: (id: string) =>
      apiClient.delete<{ message: string }>(`/ports/${id}`),
  },
};
