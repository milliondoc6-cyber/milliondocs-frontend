import { apiClient } from "./client";

export interface PartyResponse {
  id: string; // UUID
  exporter_contact_id: string;
  consignee_contact_id: string;
  buyer_contact_id: string;
  logistics_provider_contact_id: string;
  notify_party_contact_id: string;
  created_at: string;
  updated_at: string;
}

export interface PartyListResponse {
  page: number;
  page_size: number;
  total: number;
  items: PartyResponse[];
}

export interface PartyCreatePayload {
  master_file_id?: string | null;
  exporter_contact_id: string;
  consignee_contact_id: string;
  buyer_contact_id: string;
  logistics_provider_contact_id: string;
  notify_party_contact_id: string;
}

export type PartyPatchPayload = Partial<PartyCreatePayload>;

export const partiesApi = {
  list: (page = 1, pageSize = 10) =>
    apiClient.get<PartyListResponse>(
      `/parties?page=${page}&page_size=${pageSize}`
    ),
  get: (id: string) => apiClient.get<PartyResponse>(`/parties/${id}`),
  create: (payload: PartyCreatePayload) =>
    apiClient.post<PartyResponse>("/parties", payload),
  update: (id: string, payload: PartyPatchPayload) =>
    apiClient.patch<PartyResponse>(`/parties/${id}`, payload),
};
