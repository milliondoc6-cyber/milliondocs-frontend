const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface UserResponse {
  id: number;
  email: string;
  username?: string | null;
  phone_number?: string | null;
  email_verified: boolean;
}

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

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const errBody = await response.json();
      errorMessage = errBody?.detail || JSON.stringify(errBody) || errorMessage;
    } catch {
      // Ignore if body is not JSON
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export const api = {
  auth: {
    register: (payload: any) =>
      apiRequest<{ message: string }>("/users", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    verifyOtp: (payload: { email: string; otp: string }) =>
      apiRequest<{ message: string }>("/verify-otp", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    login: (payload: any) =>
      apiRequest<{ access_token: string; token_type: string }>("/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    me: () =>
      apiRequest<UserResponse>("/users/me"),
  },

  contacts: {
    list: (roles?: string[]) => {
      const query = roles ? `?role=${roles.join(",")}` : "";
      return apiRequest<ContactResponse[]>(`/contacts${query}`);
    },
    create: (formData: FormData) =>
      apiRequest<ContactResponse>("/contacts", {
        method: "POST",
        body: formData, // FormData matches multipart/form-data
      }),
    update: (id: string, formData: FormData) =>
      apiRequest<ContactResponse>(`/contacts/${id}`, {
        method: "PATCH",
        body: formData,
      }),
    delete: (id: string) =>
      apiRequest<{ message: string }>(`/contacts/${id}`, {
        method: "DELETE",
      }),
  },

  products: {
    list: (page = 1, search?: string) => {
      let query = `?page=${page}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      return apiRequest<ProductListResponse>(`/product${query}`);
    },
    create: (payload: any) =>
      apiRequest<ProductResponse>("/product", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: any) =>
      apiRequest<ProductResponse>(`/product/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      apiRequest<{ message: string }>(`/product/${id}`, {
        method: "DELETE",
      }),
  },

  shipments: {
    get: (id: string) =>
      apiRequest<ShipmentResponse>(`/shipments/${id}`),
    create: (payload: any) =>
      apiRequest<ShipmentResponse>("/shipments", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: any) =>
      apiRequest<ShipmentResponse>(`/shipments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      apiRequest<{ message: string }>(`/shipments/${id}`, {
        method: "DELETE",
      }),
  },
};
