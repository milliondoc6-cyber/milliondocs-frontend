import { api, getErrorStatus, type ShipmentResponse } from "@/lib/api";

/**
 * The deployed backend has no `GET /shipments` list route — only
 * `GET /shipments/{id}`. To still show a real list (no mock data), we remember
 * the IDs of shipments created in this browser and fetch each one by ID.
 *
 * We also remember the related records created alongside each shipment (master
 * file, party, product details, shipping details) so the detail page can load
 * them by their real IDs — none of the list endpoints expose `master_file_id`,
 * so this client-side link is the only way to reconnect a shipment to its
 * related records using the endpoints that actually exist.
 */
const KEY = "milliondocs:shipmentIds";
const BUNDLE_KEY = "milliondocs:shipmentBundles";

export interface ShipmentBundle {
  shipmentId: string;
  masterFileId: string;
  partyId?: string;
  shippingDetailsId?: string;
  productDetailIds?: string[];
  /**
   * Names of the document sets chosen for this shipment. The backend has no
   * shipment<->document link endpoint yet, so the selection lives here.
   */
  documentSetNames?: string[];
}

function readBundles(): Record<string, ShipmentBundle> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(BUNDLE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveBundle(bundle: ShipmentBundle): void {
  if (typeof window === "undefined") return;
  const all = readBundles();
  all[bundle.shipmentId] = bundle;
  localStorage.setItem(BUNDLE_KEY, JSON.stringify(all));
}

export function getBundle(shipmentId: string): ShipmentBundle | null {
  return readBundles()[shipmentId] ?? null;
}

export function updateBundle(shipmentId: string, patch: Partial<ShipmentBundle>): ShipmentBundle | null {
  const current = getBundle(shipmentId);
  if (!current) return null;
  const next = { ...current, ...patch };
  saveBundle(next);
  return next;
}

/**
 * Hand-off for the new-shipment flow: the document-set popup runs first, then
 * the builder opens on a different route. We stash the chosen document names in
 * sessionStorage so the builder can attach them to the shipment after saving.
 */
const PENDING_DOCS_KEY = "milliondocs:pendingDocumentSet";

export function setPendingDocumentSet(names: string[]): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_DOCS_KEY, JSON.stringify(names));
}

/** Read AND clear the pending document-set selection (one-shot). */
export function takePendingDocumentSet(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(PENDING_DOCS_KEY);
    sessionStorage.removeItem(PENDING_DOCS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify([...new Set(ids)]));
}

export function addShipmentId(id: string): void {
  write([id, ...read()]);
}

export function removeShipmentId(id: string): void {
  write(read().filter((x) => x !== id));
}

export function getShipmentIds(): string[] {
  return read();
}

/**
 * Fetch every locally-tracked shipment by ID. Prunes IDs that 404 (deleted on
 * the server) and returns the rest newest-first.
 */
export async function fetchStoredShipments(): Promise<ShipmentResponse[]> {
  const ids = read();
  if (!ids.length) return [];

  const results = await Promise.allSettled(ids.map((id) => api.shipments.get(id)));

  const ok: ShipmentResponse[] = [];
  const stale: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") ok.push(r.value);
    else if (getErrorStatus(r.reason) === 404) stale.push(ids[i]);
  });

  if (stale.length) write(ids.filter((id) => !stale.includes(id)));

  ok.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return ok;
}
