import { apiClient } from "./client";

/**
 * Additional Charges = the money/totals block for a master file:
 * extra charge lines (freight, handling, insurance…) + an optional tax,
 * with backend-computed subtotal / charges total / tax amount / grand total.
 *
 * Unlike parties/products, this resource can be fetched directly by
 * master_file_id via GET /additional-charges/master-file/{id}.
 */

export interface ChargeLineResponse {
  id: string;
  name: string;
  amount: string; // backend serialises decimals as strings
  created_at: string;
  updated_at: string;
}

export interface AdditionalChargesResponse {
  id: string;
  master_file_id: string | null;
  charges: ChargeLineResponse[];
  tax_name: string | null;
  tax_rate: string | null;
  subtotal: string;
  additional_charges_total: string;
  tax_amount: string;
  total_amount: string;
  created_at: string;
  updated_at: string;
}

export interface ChargeLineInput {
  name: string;
  amount: number | string;
}

export interface AdditionalChargesCreatePayload {
  master_file_id?: string | null;
  charges: ChargeLineInput[];
  tax_name?: string | null;
  tax_rate?: number | string | null;
}

export interface AdditionalChargesPatchPayload {
  master_file_id?: string | null;
  tax_name?: string | null;
  tax_rate?: number | string | null;
}

export type ChargeLinePatchPayload = Partial<ChargeLineInput>;

export const additionalChargesApi = {
  create: (payload: AdditionalChargesCreatePayload) =>
    apiClient.post<AdditionalChargesResponse>("/additional-charges", payload),
  getByMasterFile: (masterFileId: string) =>
    apiClient.get<AdditionalChargesResponse>(`/additional-charges/master-file/${masterFileId}`),
  get: (id: string) =>
    apiClient.get<AdditionalChargesResponse>(`/additional-charges/${id}`),
  update: (id: string, payload: AdditionalChargesPatchPayload) =>
    apiClient.patch<AdditionalChargesResponse>(`/additional-charges/${id}`, payload),
  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/additional-charges/${id}`),
  addLine: (id: string, payload: ChargeLineInput) =>
    apiClient.post<AdditionalChargesResponse>(`/additional-charges/${id}/lines`, payload),
  updateLine: (id: string, lineId: string, payload: ChargeLinePatchPayload) =>
    apiClient.patch<AdditionalChargesResponse>(`/additional-charges/${id}/lines/${lineId}`, payload),
  deleteLine: (id: string, lineId: string) =>
    apiClient.delete<AdditionalChargesResponse>(`/additional-charges/${id}/lines/${lineId}`),
};
