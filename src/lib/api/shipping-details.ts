import { apiClient } from "./client";

export interface ShippingDetailsResponse {
  id: string; // UUID
  etd: string; // date (YYYY-MM-DD)
  eta: string; // date (YYYY-MM-DD)
  vessel_aircraft_vehicle: string;
  voyage_flight_number: string;
  bill_of_lading_number: string;
  export_declaration_number: string;
  document_instructions: string;
  freight_charges: string;
  marine_cover_policy_number: string;
  hazardous_goods: boolean;
  letter_of_credit: boolean;
  letter_of_credit_number?: string | null;
  special_instructions?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingDetailsCreatePayload {
  master_file_id?: string | null;
  etd: string;
  eta: string;
  vessel_aircraft_vehicle: string;
  voyage_flight_number: string;
  bill_of_lading_number: string;
  export_declaration_number: string;
  document_instructions: string;
  freight_charges: string;
  marine_cover_policy_number: string;
  hazardous_goods: boolean;
  letter_of_credit: boolean;
  letter_of_credit_number?: string | null;
  special_instructions?: string | null;
}

export type ShippingDetailsPatchPayload = Partial<
  Omit<ShippingDetailsCreatePayload, "master_file_id">
>;

export const shippingDetailsApi = {
  get: (id: string) =>
    apiClient.get<ShippingDetailsResponse>(`/shipping-details/${id}`),
  create: (payload: ShippingDetailsCreatePayload) =>
    apiClient.post<ShippingDetailsResponse>("/shipping-details", payload),
  update: (id: string, payload: ShippingDetailsPatchPayload) =>
    apiClient.patch<ShippingDetailsResponse>(`/shipping-details/${id}`, payload),
  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/shipping-details/${id}`),
};
