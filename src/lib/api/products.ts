import { apiClient } from "./client";

export interface ProductResponse {
  id: string; // UUID
  code: string; // SKU
  description?: string | null; // Name
  unit_of_measurement?: string | null; // Unit
  country_of_origin: string;
  hs_code?: string | null;
  sell_price?: number | null;
  buy_price?: number | null;
  net_weight_kg?: number | null;
  gross_weight_kg?: number | null;
  cubic_measurement_m3?: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  custom_fields?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  page: number;
  page_size: number;
  total: number;
  items: ProductResponse[];
}

export const productsApi = {
  list: (page = 1, search?: string) => {
    let query = `?page=${page}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    return apiClient.get<ProductListResponse>(`/product${query}`);
  },
  create: (payload: Record<string, unknown>) =>
    apiClient.post<ProductResponse>("/product", payload),
  update: (id: string, payload: Record<string, unknown>) =>
    apiClient.patch<ProductResponse>(`/product/${id}`, payload),
  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/product/${id}`),
};
