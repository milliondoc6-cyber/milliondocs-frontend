/**
 * The single API surface for the whole app.
 *
 *   import { api } from "@/lib/api";
 *   await api.auth.login({ email, password });
 *   await api.contacts.list();
 *
 * Structure (centralized API layer):
 *   client.ts      — the ONE fetch wrapper (auth header, base URL, errors, tokens)
 *   <domain>.ts    — one file per domain: its types + its endpoints
 *   index.ts       — this barrel: mounts every domain under `api` + re-exports helpers
 */
import { authApi } from "./auth";
import { contactsApi } from "./contacts";
import { productsApi } from "./products";
import { shipmentsApi } from "./shipments";

export const api = {
  auth: authApi,
  contacts: contactsApi,
  products: productsApi,
  shipments: shipmentsApi,
};

// Transport helpers
export {
  apiClient,
  ApiError,
  getToken,
  setToken,
  clearToken,
  getErrorMessage,
  getErrorStatus,
} from "./client";

// Domain types (so pages can `import { api, ContactResponse } from "@/lib/api"`)
export type { UserResponse, AuthToken, RegisterPayload } from "./auth";
export type { ContactAddress, ContactResponse } from "./contacts";
export type { ProductResponse, ProductListResponse } from "./products";
export type { ShipmentLookup, ShipmentResponse } from "./shipments";
