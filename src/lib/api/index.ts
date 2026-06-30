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
import { additionalChargesApi } from "./additional-charges";
import { authApi } from "./auth";
import { contactsApi } from "./contacts";
import { documentSetsApi } from "./document-sets";
import { masterFilesApi } from "./master-files";
import { partiesApi } from "./parties";
import { productDetailsApi } from "./product-details";
import { productsApi } from "./products";
import { referenceDataApi } from "./reference-data";
import { shipmentsApi } from "./shipments";
import { shippingDetailsApi } from "./shipping-details";

export const api = {
  auth: authApi,
  additionalCharges: additionalChargesApi,
  contacts: contactsApi,
  documentSets: documentSetsApi,
  products: productsApi,
  productDetails: productDetailsApi,
  masterFiles: masterFilesApi,
  referenceData: referenceDataApi,
  shipments: shipmentsApi,
  shippingDetails: shippingDetailsApi,
  parties: partiesApi,
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
export type {
  ProductDetailResponse,
  ProductDetailItem,
  ProductDetailCreatePayload,
  ProductDetailBulkCreateResponse,
  ProductDetailListResponse,
  ProductDetailPatchPayload,
} from "./product-details";
export type {
  MasterFileResponse,
  MasterFileListResponse,
  MasterFileCreatePayload,
  MasterFilePatchPayload,
} from "./master-files";
export type {
  ReferenceDataResponse,
  CountryResponse,
  PortResponse,
} from "./reference-data";
export type {
  ShipmentLookup,
  ShipmentResponse,
  ShipmentListResponse,
} from "./shipments";
export type {
  ShippingDetailsResponse,
  ShippingDetailsCreatePayload,
  ShippingDetailsPatchPayload,
} from "./shipping-details";
export type {
  PartyResponse,
  PartyListResponse,
  PartyCreatePayload,
  PartyPatchPayload,
} from "./parties";
export type {
  ChargeLineResponse,
  ChargeLineInput,
  ChargeLinePatchPayload,
  AdditionalChargesResponse,
  AdditionalChargesCreatePayload,
  AdditionalChargesPatchPayload,
} from "./additional-charges";
export type {
  DocumentSetResponse,
  DocumentSetListParams,
} from "./document-sets";
