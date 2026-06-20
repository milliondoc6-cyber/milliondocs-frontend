import { apiClient } from "./client";

export interface ContactAddress {
  city: string;
  state: string;
  pincode: number;
  country: string;
}

export interface ContactResponse {
  id: string; // UUID
  company_name: string;
  logo_path?: string | null;
  role: "customer" | "supplier" | "forwarding" | "other";
  primary_person: string;
  email: string;
  street_address: string;
  address: ContactAddress;
  contact_info: number; // BigInteger
  taxId?: string; // Mock property (unsupported by backend)
}

export const contactsApi = {
  list: (roles?: string[]) => {
    const query = roles ? `?role=${roles.join(",")}` : "";
    return apiClient.get<ContactResponse[]>(`/contacts${query}`);
  },
  create: (formData: FormData) =>
    apiClient.post<ContactResponse>("/contacts", formData),
  update: (id: string, formData: FormData) =>
    apiClient.patch<ContactResponse>(`/contacts/${id}`, formData),
  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/contacts/${id}`),
};
