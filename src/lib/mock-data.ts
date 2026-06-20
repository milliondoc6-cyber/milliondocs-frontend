export type ShipmentStatus = "draft" | "in_transit" | "delivered" | "delayed" | "cancelled";

export interface ContactAddress {
  city: string;
  state: string;
  pincode: number;
  country: string;
}

export interface Contact {
  id: string; // UUID in backend, string in mock
  company_name: string; // matches backend
  logo_path?: string | null; // matches backend
  role: "customer" | "supplier" | "forwarding" | "other"; // matches backend _ROLE_VALUES
  primary_person: string; // matches backend
  email: string;
  street_address: string; // matches backend
  address: ContactAddress; // matches backend
  contact_info: number; // matches backend phone number as BigInt
  
  // Backward-compatibility fields for mock pages
  company: string;
  name: string;
  type: "buyer" | "supplier" | "consignee" | "forwarder";
  phone: string;
  country: string;
  city: string;
  taxId: string; // TODO: taxId missing in backend Contact schema
}

export interface Product {
  id: string;
  code: string; // maps to SKU
  description?: string | null; // maps to product Name
  unit_of_measurement?: string | null; // maps to product Unit
  country_of_origin: string; // matches backend (required field)
  hs_code?: string | null;
  sell_price?: number | null; // maps to unitPrice
  buy_price?: number | null;
  net_weight_kg?: number | null;
  gross_weight_kg?: number | null;
  cubic_measurement_m3?: number | null;
  custom_fields?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
  // Unsupported/Mock metadata kept for UI display compatibility
  currency?: string; // TODO: Missing in backend Product table
  category?: string; // TODO: Missing in backend Product table
  cartonDims?: string; // TODO: Missing in backend Product table
}

export interface ShipmentLookup {
  id: string;
  value: string;
}

export interface Shipment {
  id: string;
  shipment_reference: string; // maps to number
  number: string; // UI compat for mock data displays
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
  created_at?: string;
  updated_at?: string;

  // Backward-compatibility fields for mock pages
  incoterm: string;
  dispatchMethod: string;
  portOfLoading: string;
  portOfDischarge: string;

  // Resolved lookup objects (optionally present from API joins)
  incoterm_lookup?: ShipmentLookup;
  shipment_type?: ShipmentLookup;
  dispatch_method?: ShipmentLookup;
  port_of_loading?: ShipmentLookup;
  port_of_discharge?: ShipmentLookup;
  origin_country?: ShipmentLookup;
  destination_country?: ShipmentLookup;
  pre_carriage_by?: ShipmentLookup | null;

  // Unsupported/Mock metadata kept for UI display compatibility
  status: ShipmentStatus; // TODO: Missing in backend ShipmentInformation table
  buyerId: string; // TODO: No explicit direct FK relationships mapped this way
  supplierId: string; // TODO: No explicit supplier FK on ShipmentInformation
  consigneeId?: string;
  forwarderId?: string;
  currency: string;
  totalValue: number;
  etd: string;
  eta: string;
  items: { productId: string; quantity: number; cartons: number }[]; // TODO: Backend has no shipment products table
  notes?: string;
  containers: { id: string; number: string; type: string; sealNo: string }[]; // TODO: Backend has no containers table
  documents: { id: string; type: string; status: "draft" | "ready" | "signed"; updatedAt: string; version: number }[]; // TODO: Backend has no docs table
  files: { id: string; name: string; size: string; uploadedAt: string }[]; // TODO: Backend has no files table
  activity: { id: string; user: string; action: string; at: string }[]; // TODO: Backend has no activity log table
}

export const contacts: Contact[] = [
  {
    id: "c1",
    company_name: "Bremen Trading GmbH",
    company: "Bremen Trading GmbH",
    role: "customer",
    type: "buyer",
    primary_person: "Hannah Schmidt",
    name: "Hannah Schmidt",
    email: "h.schmidt@gmail.com",
    street_address: "Hafenstrasse 24",
    address: { city: "Bremen", state: "HB", pincode: 282170, country: "Germany" },
    contact_info: 4942155501,
    phone: "+49 421 555 0192",
    city: "Bremen",
    country: "Germany",
    taxId: "DE298471123",
  },
  {
    id: "c2",
    company_name: "Osaka Imports Co.",
    company: "Osaka Imports Co.",
    role: "customer",
    type: "buyer",
    primary_person: "Yuki Tanaka",
    name: "Yuki Tanaka",
    email: "tanaka@gmail.com",
    street_address: "2-3-4 Nishi",
    address: { city: "Osaka", state: "Osaka", pincode: 550001, country: "Japan" },
    contact_info: 8166543210,
    phone: "+81 6 6543 2100",
    city: "Osaka",
    country: "Japan",
    taxId: "JP4120001234567",
  },
  {
    id: "c3",
    company_name: "Pacific Goods LLC",
    company: "Pacific Goods LLC",
    role: "customer",
    type: "buyer",
    primary_person: "Marcus Reyes",
    name: "Marcus Reyes",
    email: "marcus@gmail.com",
    street_address: "1200 Pier Ave",
    address: { city: "Long Beach", state: "CA", pincode: 908020, country: "USA" },
    contact_info: 1562555014,
    phone: "+1 562 555 0144",
    city: "Long Beach",
    country: "USA",
    taxId: "US-EIN-87-1234567",
  },
  {
    id: "c4",
    company_name: "Mehta Textiles Pvt Ltd",
    company: "Mehta Textiles Pvt Ltd",
    role: "supplier",
    type: "supplier",
    primary_person: "Rajiv Mehta",
    name: "Rajiv Mehta",
    email: "rajiv@gmail.com",
    street_address: "Plot 14, Hojiwala Estate",
    address: { city: "Surat", state: "Gujarat", pincode: 395003, country: "India" },
    contact_info: 9126124567,
    phone: "+91 261 245 6789",
    city: "Surat",
    country: "India",
    taxId: "GSTIN24ABCDE1234F1Z5",
  },
  {
    id: "c5",
    company_name: "Saigon Crafts JSC",
    company: "Saigon Crafts JSC",
    role: "supplier",
    type: "supplier",
    primary_person: "Linh Nguyen",
    name: "Linh Nguyen",
    email: "linh@gmail.com",
    street_address: "45 Le Loi",
    address: { city: "Ho Chi Minh", state: "HCMC", pincode: 700000, country: "Vietnam" },
    contact_info: 8428382345,
    phone: "+84 28 3823 4500",
    city: "Ho Chi Minh",
    country: "Vietnam",
    taxId: "VN0312456789",
  },
  {
    id: "c6",
    company_name: "Nordic Distribution AS",
    company: "Nordic Distribution AS",
    role: "customer",
    type: "consignee",
    primary_person: "Erik Larsen",
    name: "Erik Larsen",
    email: "erik@gmail.com",
    street_address: "Storgata 11",
    address: { city: "Oslo", state: "Oslo", pincode: 101550, country: "Norway" },
    contact_info: 4722555010,
    phone: "+47 22 555 010",
    city: "Oslo",
    country: "Norway",
    taxId: "NO998877665MVA",
  },
  {
    id: "c7",
    company_name: "Global Freight Lines",
    company: "Global Freight Lines",
    role: "forwarding",
    type: "forwarder",
    primary_person: "Operations",
    name: "Operations",
    email: "ops@gmail.com",
    street_address: "30 Raffles Place",
    address: { city: "Singapore", state: "SG", pincode: 486220, country: "Singapore" },
    contact_info: 6565001212,
    phone: "+65 6500 1212",
    city: "Singapore",
    country: "Singapore",
    taxId: "SG201912345K",
  },
  {
    id: "c8",
    company_name: "Atlas Logistics",
    company: "Atlas Logistics",
    role: "forwarding",
    type: "forwarder",
    primary_person: "Operations Manager",
    name: "Operations Manager",
    email: "dubai@gmail.com",
    street_address: "JAFZA",
    address: { city: "Dubai", state: "Dubai", pincode: 100000, country: "UAE" },
    contact_info: 9714555900,
    phone: "+971 4 555 9000",
    city: "Dubai",
    country: "UAE",
    taxId: "AE100123456789003",
  },
];

export const products: Product[] = [
  { id: "p1", code: "TX-COT-200", description: "Combed Cotton Yarn 30s", hs_code: "5205.23", unit_of_measurement: "kg", sell_price: 4.85, country_of_origin: "India", currency: "USD", net_weight_kg: 25, gross_weight_kg: 25.6, cartonDims: "60x40x30", category: "Textiles" },
  { id: "p2", code: "TX-DEN-114", description: "Denim Fabric 12oz", hs_code: "5209.42", unit_of_measurement: "m", sell_price: 6.20, country_of_origin: "India", currency: "USD", net_weight_kg: 0.42, gross_weight_kg: 0.45, cartonDims: "80x40x35", category: "Textiles" },
  { id: "p3", code: "HM-CER-009", description: "Hand-glazed Ceramic Bowl", hs_code: "6912.00", unit_of_measurement: "pcs", sell_price: 3.40, country_of_origin: "Vietnam", currency: "USD", net_weight_kg: 0.6, gross_weight_kg: 0.85, cartonDims: "50x30x25", category: "Homeware" },
  { id: "p4", code: "FD-CSH-500", description: "Roasted Cashew W320", hs_code: "0801.32", unit_of_measurement: "kg", sell_price: 9.10, country_of_origin: "Vietnam", currency: "USD", net_weight_kg: 10, gross_weight_kg: 10.4, cartonDims: "40x30x25", category: "Food" },
  { id: "p5", code: "MC-BRG-018", description: "Stainless Bearings 6204", hs_code: "8482.10", unit_of_measurement: "pcs", sell_price: 1.15, country_of_origin: "India", currency: "USD", net_weight_kg: 0.12, gross_weight_kg: 0.18, cartonDims: "30x20x15", category: "Machinery" },
  { id: "p6", code: "FN-OAK-220", description: "Oak Coffee Table", hs_code: "9403.60", unit_of_measurement: "pcs", sell_price: 145.00, country_of_origin: "India", currency: "USD", net_weight_kg: 22, gross_weight_kg: 28, cartonDims: "120x70x20", category: "Furniture" },
];

export const shipments: Shipment[] = [
  {
    id: "s1",
    shipment_reference: "MD-2026-0142",
    number: "MD-2026-0142",
    invoice_number: "INV-2026-0142",
    incoterm_id: "inc1",
    incoterm_place: "Hamburg",
    dispatch_method_id: "dm1",
    shipment_type_id: "st1",
    port_of_loading_id: "pol1",
    port_of_discharge_id: "pod1",
    origin_country_id: "oc1",
    destination_country_id: "dc1",
    is_active: true,

    incoterm: "FOB",
    dispatchMethod: "Sea",
    portOfLoading: "INNSA - Nhava Sheva",
    portOfDischarge: "DEHAM - Hamburg",

    status: "in_transit",
    buyerId: "c1",
    supplierId: "c4",
    consigneeId: "c6",
    forwarderId: "c7",
    currency: "USD",
    totalValue: 48250,
    etd: "2026-05-02",
    eta: "2026-06-04",
    items: [{ productId: "p1", quantity: 5000, cartons: 200 }, { productId: "p2", quantity: 2000, cartons: 50 }],
    containers: [{ id: "ct1", number: "MSCU7621934", type: "40' HC", sealNo: "SL-882134" }],
    documents: [
      { id: "d1", type: "Commercial Invoice", status: "ready", updatedAt: "2026-05-10", version: 3 },
      { id: "d2", type: "Packing List", status: "ready", updatedAt: "2026-05-10", version: 2 },
      { id: "d3", type: "Certificate of Origin", status: "draft", updatedAt: "2026-05-09", version: 1 },
      { id: "d4", type: "Bill of Lading Draft", status: "draft", updatedAt: "2026-05-11", version: 1 },
    ],
    files: [
      { id: "f1", name: "Buyer_PO_4521.pdf", size: "284 KB", uploadedAt: "2026-04-28" },
      { id: "f2", name: "Inspection_Report.pdf", size: "1.2 MB", uploadedAt: "2026-05-08" },
    ],
    activity: [
      { id: "a1", user: "Priya K.", action: "Generated Commercial Invoice v3", at: "2026-05-10 14:22" },
      { id: "a2", user: "Priya K.", action: "Updated container SL-882134", at: "2026-05-09 11:05" },
      { id: "a3", user: "System", action: "Autofilled buyer details from Bremen Trading GmbH", at: "2026-04-28 09:14" },
    ],
  },
  {
    id: "s2",
    shipment_reference: "MD-2026-0141",
    number: "MD-2026-0141",
    invoice_number: "INV-2026-0141",
    incoterm_id: "inc2",
    incoterm_place: "Osaka",
    dispatch_method_id: "dm1",
    shipment_type_id: "st1",
    port_of_loading_id: "pol2",
    port_of_discharge_id: "pod2",
    origin_country_id: "oc2",
    destination_country_id: "dc2",
    is_active: true,

    incoterm: "CIF",
    dispatchMethod: "Sea",
    portOfLoading: "VNSGN - Ho Chi Minh",
    portOfDischarge: "JPOSA - Osaka",

    status: "draft",
    buyerId: "c2",
    supplierId: "c5",
    forwarderId: "c8",
    currency: "USD",
    totalValue: 12640,
    etd: "2026-05-20",
    eta: "2026-06-02",
    items: [{ productId: "p3", quantity: 3000, cartons: 120 }],
    containers: [],
    documents: [
      { id: "d5", type: "Commercial Invoice", status: "draft", updatedAt: "2026-05-11", version: 1 },
    ],
    files: [],
    activity: [{ id: "a4", user: "Ahmed R.", action: "Created shipment", at: "2026-05-11 10:00" }],
  },
  {
    id: "s3",
    shipment_reference: "MD-2026-0138",
    number: "MD-2026-0138",
    invoice_number: "INV-2026-0138",
    incoterm_id: "inc3",
    incoterm_place: "Long Beach",
    dispatch_method_id: "dm1",
    shipment_type_id: "st1",
    port_of_loading_id: "pol2",
    port_of_discharge_id: "pod3",
    origin_country_id: "oc2",
    destination_country_id: "dc3",
    is_active: true,

    incoterm: "DAP",
    dispatchMethod: "Sea",
    portOfLoading: "VNSGN - Ho Chi Minh",
    portOfDischarge: "USLGB - Long Beach",

    status: "delivered",
    buyerId: "c3",
    supplierId: "c5",
    forwarderId: "c7",
    currency: "USD",
    totalValue: 87100,
    etd: "2026-03-12",
    eta: "2026-04-18",
    items: [{ productId: "p6", quantity: 600, cartons: 600 }],
    containers: [{ id: "ct2", number: "OOLU8821001", type: "40' HC", sealNo: "SL-771902" }],
    documents: [
      { id: "d6", type: "Commercial Invoice", status: "signed", updatedAt: "2026-04-19", version: 4 },
      { id: "d7", type: "Bill of Lading Draft", status: "signed", updatedAt: "2026-04-19", version: 2 },
    ],
    files: [],
    activity: [],
  },
  {
    id: "s4",
    shipment_reference: "MD-2026-0136",
    number: "MD-2026-0136",
    invoice_number: "INV-2026-0136",
    incoterm_id: "inc1",
    incoterm_place: "Hamburg",
    dispatch_method_id: "dm1",
    shipment_type_id: "st1",
    port_of_loading_id: "pol1",
    port_of_discharge_id: "pod1",
    origin_country_id: "oc1",
    destination_country_id: "dc1",
    is_active: true,

    incoterm: "FOB",
    dispatchMethod: "Sea",
    portOfLoading: "INNSA - Nhava Sheva",
    portOfDischarge: "DEHAM - Hamburg",

    status: "delayed",
    buyerId: "c1",
    supplierId: "c4",
    forwarderId: "c8",
    currency: "EUR",
    totalValue: 31900,
    etd: "2026-04-25",
    eta: "2026-06-01",
    items: [{ productId: "p4", quantity: 1500, cartons: 150 }],
    containers: [],
    documents: [],
    files: [],
    activity: [],
  },
  {
    id: "s5",
    shipment_reference: "MD-2026-0133",
    number: "MD-2026-0133",
    invoice_number: "INV-2026-0133",
    incoterm_id: "inc4",
    incoterm_place: "Long Beach",
    dispatch_method_id: "dm2",
    shipment_type_id: "st2",
    port_of_loading_id: "pol3",
    port_of_discharge_id: "pod3",
    origin_country_id: "oc1",
    destination_country_id: "dc3",
    is_active: true,

    incoterm: "EXW",
    dispatchMethod: "Air",
    portOfLoading: "INMAA - Chennai",
    portOfDischarge: "USLGB - Long Beach",

    status: "in_transit",
    buyerId: "c3",
    supplierId: "c4",
    currency: "USD",
    totalValue: 5400,
    etd: "2026-05-08",
    eta: "2026-05-13",
    items: [{ productId: "p5", quantity: 4000, cartons: 40 }],
    containers: [],
    documents: [],
    files: [],
    activity: [],
  },
];

export function findContact(id?: string) { return contacts.find((c) => c.id === id); }
export function findProduct(id?: string) { return products.find((p) => p.id === id); }
export function findShipment(id?: string) { return shipments.find((s) => s.id === id); }

export const statusMeta: Record<ShipmentStatus, { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "bg-muted text-muted-foreground" },
  in_transit: { label: "In Transit", tone: "bg-emerald/15 text-emerald" },
  delivered: { label: "Delivered", tone: "bg-primary/10 text-primary" },
  delayed: { label: "Delayed", tone: "bg-destructive/10 text-destructive" },
  cancelled: { label: "Cancelled", tone: "bg-muted text-muted-foreground line-through" },
};
