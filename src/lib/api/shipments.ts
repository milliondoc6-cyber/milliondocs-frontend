import { apiClient } from "./client";

export interface ShipmentLookup {
  id: string;
  value: string;
}

export interface ShipmentResponse {
  id: string;
  shipment_reference: string;
  invoice_number: string;
  buyers_reference?: string | null;
  incoterm_id: string;
  incoterm_place: string;
  dispatch_method_id: string;
  shipment_type_id: string;
  port_of_loading_id: string;
  port_of_discharge_id: string;
  final_destination?: string | null;
  origin_country_id: string;
  destination_country_id: string;
  place_of_receipt?: string | null;
  pre_carriage_by_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  incoterm: ShipmentLookup;
  shipment_type: ShipmentLookup;
  dispatch_method: ShipmentLookup;
  port_of_loading: ShipmentLookup;
  port_of_discharge: ShipmentLookup;
  origin_country: ShipmentLookup;
  destination_country: ShipmentLookup;
  pre_carriage_by?: ShipmentLookup | null;
}

export const shipmentsApi = {
  get: (id: string) => apiClient.get<ShipmentResponse>(`/shipments/${id}`),
  create: (payload: Record<string, unknown>) =>
    apiClient.post<ShipmentResponse>("/shipments", payload),
  update: (id: string, payload: Record<string, unknown>) =>
    apiClient.patch<ShipmentResponse>(`/shipments/${id}`, payload),
  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/shipments/${id}`),
};
