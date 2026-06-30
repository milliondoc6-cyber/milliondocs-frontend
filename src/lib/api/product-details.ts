import { apiClient } from "./client";

export interface ProductDetailResponse {
  id: string; // UUID
  product_id: string;
  product_code: string;
  description?: string | null;
  hs_code?: string | null;
  unit_of_measurement?: string | null;
  // Decimals are serialized as strings by the backend; accept both.
  unit_price?: number | string | null;
  quantity: number | string;
  amount?: number | string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductDetailItem {
  product_id: string;
  quantity: number | string;
}

export interface ProductDetailCreatePayload {
  master_file_id?: string | null;
  items: ProductDetailItem[];
}

export interface ProductDetailBulkCreateResponse {
  items: ProductDetailResponse[];
}

export interface ProductDetailListResponse {
  page: number;
  page_size: number;
  total: number;
  items: ProductDetailResponse[];
}

export interface ProductDetailPatchPayload {
  master_file_id?: string | null;
  product_id?: string;
  quantity?: number | string;
}

export const productDetailsApi = {
  list: (page = 1, pageSize = 10) =>
    apiClient.get<ProductDetailListResponse>(
      `/product-details?page=${page}&page_size=${pageSize}`
    ),
  get: (id: string) =>
    apiClient.get<ProductDetailResponse>(`/product-details/${id}`),
  create: (payload: ProductDetailCreatePayload) =>
    apiClient.post<ProductDetailBulkCreateResponse>("/product-details", payload),
  update: (id: string, payload: ProductDetailPatchPayload) =>
    apiClient.patch<ProductDetailResponse>(`/product-details/${id}`, payload),
  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/product-details/${id}`),
};
