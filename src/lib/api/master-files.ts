import { apiClient } from "./client";

export interface MasterFileResponse {
  id: string; // UUID
  name: string;
  is_active: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MasterFileListResponse {
  page: number;
  page_size: number;
  total: number;
  items: MasterFileResponse[];
}

export interface MasterFileCreatePayload {
  name: string;
}

export interface MasterFilePatchPayload {
  name?: string;
  is_active?: boolean;
}

export const masterFilesApi = {
  list: (page = 1, pageSize = 10) =>
    apiClient.get<MasterFileListResponse>(
      `/master-files?page=${page}&page_size=${pageSize}`
    ),
  get: (id: string) =>
    apiClient.get<MasterFileResponse>(`/master-files/${id}`),
  create: (payload: MasterFileCreatePayload) =>
    apiClient.post<MasterFileResponse>("/master-files", payload),
  update: (id: string, payload: MasterFilePatchPayload) =>
    apiClient.patch<MasterFileResponse>(`/master-files/${id}`, payload),
  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/master-files/${id}`),
};
