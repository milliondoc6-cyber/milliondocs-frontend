"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  X,
  Save,
  CheckCheck,
  FileText,
  FilePlus2,
  Upload,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  PanelLeftClose,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { api, getErrorMessage, type ContactResponse, type ProductResponse } from "@/lib/api";
import { MASTER_FILE_LABEL } from "@/lib/data/document-sets";
import { addShipmentId, saveBundle, takePendingDocumentSet } from "@/lib/data/shipment-store";

// All fields optional — the backend made these non-required, so the frontend
// no longer blocks Save on them. Empty values are omitted from the payload.
const schema = z.object({
  shipment_reference: z.string().trim().optional(),
  invoice_number: z.string().trim().optional(),
  buyers_reference: z.string().trim().optional(),
  incoterm_id: z.string().optional(),
  incoterm_place: z.string().trim().optional(),
  dispatch_method_id: z.string().optional(),
  shipment_type_id: z.string().optional(),
  port_of_loading_id: z.string().optional(),
  port_of_discharge_id: z.string().optional(),
  final_destination: z.string().trim().optional(),
  origin_country_id: z.string().optional(),
  destination_country_id: z.string().optional(),
  place_of_receipt: z.string().trim().optional(),
  pre_carriage_by_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  shipment_reference: "",
  invoice_number: "",
  buyers_reference: "",
  incoterm_id: "",
  incoterm_place: "",
  dispatch_method_id: "",
  shipment_type_id: "",
  port_of_loading_id: "",
  port_of_discharge_id: "",
  final_destination: "",
  origin_country_id: "",
  destination_country_id: "",
  place_of_receipt: "",
  pre_carriage_by_id: "",
};

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function money(v: number): string {
  return `₹ ${v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function toShipmentPayload(values: FormValues, masterFileId: string): Record<string, unknown> {
  const payload: Record<string, unknown> = { master_file_id: masterFileId };
  for (const [key, raw] of Object.entries(values)) {
    const v = typeof raw === "string" ? raw.trim() : raw;
    // Omit any empty field — never send blank reference-data IDs.
    if (v === "" || v === undefined || v === null) continue;
    payload[key] = v;
  }
  return payload;
}

type PartyKey =
  | "exporter_contact_id"
  | "consignee_contact_id"
  | "buyer_contact_id"
  | "logistics_provider_contact_id"
  | "notify_party_contact_id";

interface ProductRow {
  product_id: string;
  quantity: string;
}

interface ShippingState {
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
  letter_of_credit_number: string;
  special_instructions: string;
}

const EMPTY_SHIPPING: ShippingState = {
  etd: "",
  eta: "",
  vessel_aircraft_vehicle: "",
  voyage_flight_number: "",
  bill_of_lading_number: "",
  export_declaration_number: "",
  document_instructions: "",
  freight_charges: "",
  marine_cover_policy_number: "",
  hazardous_goods: false,
  letter_of_credit: false,
  letter_of_credit_number: "",
  special_instructions: "",
};

export default function ShipmentBuilderPage() {
  const router = useRouter();
  const docs = [MASTER_FILE_LABEL];
  const [activeDoc, setActiveDoc] = React.useState<string>(MASTER_FILE_LABEL);

  const [parties, setParties] = React.useState<Record<PartyKey, string>>({
    exporter_contact_id: "",
    consignee_contact_id: "",
    buyer_contact_id: "",
    logistics_provider_contact_id: "",
    notify_party_contact_id: "",
  });
  const [logisticsType, setLogisticsType] = React.useState<"forwarder" | "carrier">("forwarder");
  const [productRows, setProductRows] = React.useState<ProductRow[]>([]);
  const [includeShipping, setIncludeShipping] = React.useState(false);
  const [shipping, setShipping] = React.useState<ShippingState>(EMPTY_SHIPPING);
  const [chargeLines, setChargeLines] = React.useState<{ name: string; amount: string }[]>([
    { name: "", amount: "" },
  ]);
  const [taxName, setTaxName] = React.useState("");
  const [taxRate, setTaxRate] = React.useState("");

  // Documents chosen in the popup before the builder opened; attached to the
  // shipment after save so they show as its document folder.
  const pendingDocsRef = React.useRef<string[]>([]);
  React.useEffect(() => {
    pendingDocsRef.current = takePendingDocumentSet();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
    mode: "onTouched",
  });

  const incoterms = useQuery({ queryKey: ["reference-data", "incoterms"], queryFn: () => api.referenceData.items.list("incoterms") });
  const dispatchMethods = useQuery({ queryKey: ["reference-data", "dispatch_method"], queryFn: () => api.referenceData.items.list("dispatch_method") });
  const shipmentTypes = useQuery({ queryKey: ["reference-data", "shipment_type"], queryFn: () => api.referenceData.items.list("shipment_type") });
  const countries = useQuery({ queryKey: ["countries", "all"], queryFn: () => api.referenceData.countries.list({ limit: 200 }) });
  const ports = useQuery({ queryKey: ["ports", "all"], queryFn: () => api.referenceData.ports.list({ limit: 500 }) });
  const contacts = useQuery({ queryKey: ["contacts"], queryFn: () => api.contacts.list() });
  const products = useQuery({ queryKey: ["products", 1, ""], queryFn: () => api.products.list(1) });

  const refLoading =
    incoterms.isLoading || dispatchMethods.isLoading || shipmentTypes.isLoading || countries.isLoading || ports.isLoading;

  const missing: string[] = [];
  if (!refLoading) {
    if (!incoterms.data?.length) missing.push("Incoterms");
    if (!dispatchMethods.data?.length) missing.push("Dispatch methods");
    if (!shipmentTypes.data?.length) missing.push("Shipment types");
    if (!countries.data?.length) missing.push("Countries");
    if (!ports.data?.length) missing.push("Ports");
  }

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // 1. Master File (the hub everything links to)
      const masterFileName =
        values.shipment_reference?.trim() ||
        values.invoice_number?.trim() ||
        "Untitled shipment";
      const masterFile = await api.masterFiles.create({ name: masterFileName });

      // 2. Shipment Information
      const shipment = await api.shipments.create(toShipmentPayload(values, masterFile.id));

      const bundle = {
        shipmentId: shipment.id,
        masterFileId: masterFile.id,
        partyId: undefined as string | undefined,
        shippingDetailsId: undefined as string | undefined,
        productDetailIds: undefined as string[] | undefined,
        documentSetNames: pendingDocsRef.current.length
          ? pendingDocsRef.current
          : undefined,
      };

      // 3. Parties (only if all five contacts chosen)
      if (Object.values(parties).every(Boolean)) {
        try {
          const party = await api.parties.create({ ...parties, master_file_id: masterFile.id });
          bundle.partyId = party.id;
        } catch (e) {
          toast.warning(`Parties not saved: ${getErrorMessage(e)}`);
        }
      }

      // 4. Product line items
      const validRows = productRows.filter((r) => r.product_id && Number(r.quantity) > 0);
      if (validRows.length) {
        try {
          const res = await api.productDetails.create({
            master_file_id: masterFile.id,
            items: validRows.map((r) => ({ product_id: r.product_id, quantity: Number(r.quantity) })),
          });
          bundle.productDetailIds = res.items.map((i) => i.id);
        } catch (e) {
          toast.warning(`Products not saved: ${getErrorMessage(e)}`);
        }
      }

      // 5. Shipping Details (optional)
      if (includeShipping) {
        try {
          const sd = await api.shippingDetails.create({
            master_file_id: masterFile.id,
            etd: shipping.etd,
            eta: shipping.eta,
            vessel_aircraft_vehicle: shipping.vessel_aircraft_vehicle,
            voyage_flight_number: shipping.voyage_flight_number,
            bill_of_lading_number: shipping.bill_of_lading_number,
            export_declaration_number: shipping.export_declaration_number,
            document_instructions: shipping.document_instructions,
            freight_charges: shipping.freight_charges,
            marine_cover_policy_number: shipping.marine_cover_policy_number,
            hazardous_goods: shipping.hazardous_goods,
            letter_of_credit: shipping.letter_of_credit,
            letter_of_credit_number: shipping.letter_of_credit_number || null,
            special_instructions: shipping.special_instructions || null,
          });
          bundle.shippingDetailsId = sd.id;
        } catch (e) {
          toast.warning(`Shipping details not saved: ${getErrorMessage(e)}`);
        }
      }

      // 6. Additional charges & tax
      const validLines = chargeLines.filter((l) => l.name.trim() && Number(l.amount) > 0);
      if (validLines.length || taxName.trim() || taxRate.trim()) {
        try {
          await api.additionalCharges.create({
            master_file_id: masterFile.id,
            charges: validLines.map((l) => ({ name: l.name.trim(), amount: Number(l.amount) })),
            tax_name: taxName.trim() || null,
            tax_rate: taxRate.trim() ? Number(taxRate) : null,
          });
        } catch (e) {
          toast.warning(`Additional charges not saved: ${getErrorMessage(e)}`);
        }
      }

      saveBundle(bundle);
      addShipmentId(shipment.id);
      return shipment;
    },
    onSuccess: (created) => {
      toast.success("Shipment saved");
      router.push(`/shipments/${created.id}`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const validateBeforeSave = (): boolean => {
    // Fields are optional now (backend relaxed them). Keep only the few sanity
    // checks that would otherwise make the backend reject the sub-records.
    if (includeShipping && shipping.etd && shipping.eta && shipping.etd > shipping.eta) {
      toast.error("Shipping: ETD cannot be after ETA.");
      return false;
    }
    if (includeShipping && shipping.letter_of_credit && !shipping.letter_of_credit_number.trim()) {
      toast.error("Shipping: Letter of credit number is required when LC is enabled.");
      return false;
    }
    return true;
  };

  const onSave = form.handleSubmit((values) => {
    if (!validateBeforeSave()) return;
    mutation.mutate(values);
  });

  const close = () => router.push("/shipments");
  const submitting = mutation.isPending;
  const contactList = contacts.data ?? [];
  const productList = products.data?.items ?? [];

  const productById = (pid: string) => productList.find((p) => p.id === pid);
  const subtotal = productRows.reduce((sum, r) => sum + num(r.quantity) * num(productById(r.product_id)?.sell_price), 0);
  const chargesTotal = chargeLines.reduce((sum, l) => sum + num(l.amount), 0);
  const rate = num(taxRate);
  const taxAmount = ((subtotal + chargesTotal) * rate) / 100;
  const grandTotal = subtotal + chargesTotal + taxAmount;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="h-14 border-b border-border flex items-center px-4 gap-3 shrink-0">
        <button onClick={close} className="p-1.5 rounded hover:bg-muted" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
        <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
        <div className="text-sm">
          <span className="text-muted-foreground">Shipment</span>
          <span className="text-muted-foreground mx-1.5">/</span>
          <span className="font-medium">{activeDoc}</span>
        </div>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onSave} disabled={submitting}>
          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
        </Button>
        <Button size="sm" className="gap-1.5" onClick={onSave} disabled={submitting}>
          <CheckCheck className="h-3.5 w-3.5" /> Save &amp; Quit
        </Button>
      </header>

      <div className="flex-1 flex min-h-0">
        <aside className="w-64 border-r border-border flex flex-col shrink-0 bg-muted/20">
          <div className="px-4 py-3 flex items-center justify-between border-b border-border">
            <span className="text-sm font-semibold">Documents</span>
          </div>
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {docs.map((doc) => (
              <button
                key={doc}
                onClick={() => setActiveDoc(doc)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm text-left transition-colors",
                  activeDoc === doc ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                )}
              >
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{doc}</span>
              </button>
            ))}
          </nav>
          <div className="p-2 border-t border-border space-y-0.5">
            <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm text-primary hover:bg-muted">
              <FilePlus2 className="h-4 w-4" /> Create documents...
            </button>
            <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted">
              <Upload className="h-4 w-4" /> Upload Files
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 py-8 space-y-10">
            <h1 className="text-2xl font-semibold tracking-tight">Master File</h1>

            {missing.length > 0 && (
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 rounded-lg p-3">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Backend has no data for <b>{missing.join(", ")}</b>. Those dropdowns are empty and
                  saving will fail until that reference data is added.
                </span>
              </div>
            )}

            {/* 1. Shipment Information */}
            <Section n={1} title="Shipment Information">
              {refLoading ? (
                <Loading />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Text form={form} name="shipment_reference" label="Shipment Reference" disabled={submitting} />
                  <Text form={form} name="invoice_number" label="Invoice Number" disabled={submitting} />
                  <Text form={form} name="buyers_reference" label="Buyers Reference" disabled={submitting} />
                  <div className="grid grid-cols-2 gap-2">
                    <Pick form={form} name="incoterm_id" label="Incoterm® 2020" placeholder="Term" disabled={submitting}
                      options={(incoterms.data ?? []).map((i) => ({ value: i.id, label: i.item }))} />
                    <Text form={form} name="incoterm_place" label="&nbsp;" placeholder="Place" disabled={submitting} />
                  </div>
                  <Pick form={form} name="dispatch_method_id" label="Method of Dispatch" disabled={submitting}
                    options={(dispatchMethods.data ?? []).map((i) => ({ value: i.id, label: i.item }))} />
                  <Pick form={form} name="shipment_type_id" label="Type of Shipment" disabled={submitting}
                    options={(shipmentTypes.data ?? []).map((i) => ({ value: i.id, label: i.item }))} />
                  <Pick form={form} name="port_of_loading_id" label="Port of Loading" disabled={submitting}
                    options={(ports.data ?? []).map((p) => ({ value: p.id, label: p.name }))} />
                  <Pick form={form} name="port_of_discharge_id" label="Port of Discharge" disabled={submitting}
                    options={(ports.data ?? []).map((p) => ({ value: p.id, label: p.name }))} />
                  <Text form={form} name="final_destination" label="Final Destination" disabled={submitting} />
                  <Pick form={form} name="origin_country_id" label="Country of Origin of Goods" disabled={submitting}
                    options={(countries.data ?? []).map((c) => ({ value: c.id, label: c.name }))} />
                  <Pick form={form} name="destination_country_id" label="Country of Final Destination" disabled={submitting}
                    options={(countries.data ?? []).map((c) => ({ value: c.id, label: c.name }))} />
                  <Text form={form} name="place_of_receipt" label="Place of Receipt" disabled={submitting} />
                  <Pick form={form} name="pre_carriage_by_id" label="Pre-Carriage By" disabled={submitting}
                    options={(dispatchMethods.data ?? []).map((i) => ({ value: i.id, label: i.item }))} />
                </div>
              )}
            </Section>

            {/* 2. Parties */}
            <Section n={2} title="Parties">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PartyPick label="Exporter" value={parties.exporter_contact_id} contacts={contactList}
                  onChange={(v) => setParties((p) => ({ ...p, exporter_contact_id: v }))} />
                <PartyPick label="Consignee" value={parties.consignee_contact_id} contacts={contactList}
                  onChange={(v) => setParties((p) => ({ ...p, consignee_contact_id: v }))} />
                <PartyPick label="Buyer if not Consignee" value={parties.buyer_contact_id} contacts={contactList}
                  onChange={(v) => setParties((p) => ({ ...p, buyer_contact_id: v }))} />
                <div className="md:col-span-2">
                  <div className="flex items-center gap-4 mb-1.5">
                    <span className="text-sm font-medium">Logistics Provider</span>
                    <label className="flex items-center gap-1.5 text-xs">
                      <input type="radio" checked={logisticsType === "forwarder"} onChange={() => setLogisticsType("forwarder")} />
                      Freight Forwarder
                    </label>
                    <label className="flex items-center gap-1.5 text-xs">
                      <input type="radio" checked={logisticsType === "carrier"} onChange={() => setLogisticsType("carrier")} />
                      Carrier
                    </label>
                  </div>
                  <PartyPick label="" value={parties.logistics_provider_contact_id} contacts={contactList}
                    onChange={(v) => setParties((p) => ({ ...p, logistics_provider_contact_id: v }))} />
                </div>
                <PartyPick label="Notify Party" value={parties.notify_party_contact_id} contacts={contactList}
                  onChange={(v) => setParties((p) => ({ ...p, notify_party_contact_id: v }))} />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Optional — fill all five to link parties to this shipment.
              </p>
            </Section>

            {/* 3. Shipping Details */}
            <Section n={3} title="Shipping Details">
              <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer">
                <Checkbox checked={includeShipping} onCheckedChange={(c) => setIncludeShipping(!!c)} />
                Add shipping details to this shipment
              </label>
              {includeShipping && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Plain label="Date of Departure (ETD)" type="date" value={shipping.etd} onChange={(v) => setShipping((s) => ({ ...s, etd: v }))} />
                  <Plain label="Est. Time of Arrival (ETA)" type="date" value={shipping.eta} onChange={(v) => setShipping((s) => ({ ...s, eta: v }))} />
                  <Plain label="Vessel / Aircraft / Vehicle" value={shipping.vessel_aircraft_vehicle} onChange={(v) => setShipping((s) => ({ ...s, vessel_aircraft_vehicle: v }))} />
                  <Plain label="Voyage / Flight Number" value={shipping.voyage_flight_number} onChange={(v) => setShipping((s) => ({ ...s, voyage_flight_number: v }))} />
                  <Plain label="Bill of Lading Number" value={shipping.bill_of_lading_number} onChange={(v) => setShipping((s) => ({ ...s, bill_of_lading_number: v }))} />
                  <Plain label="Export Declaration Number" value={shipping.export_declaration_number} onChange={(v) => setShipping((s) => ({ ...s, export_declaration_number: v }))} />
                  <Plain label="Document Instructions" value={shipping.document_instructions} onChange={(v) => setShipping((s) => ({ ...s, document_instructions: v }))} />
                  <Plain label="Freight Charges" value={shipping.freight_charges} onChange={(v) => setShipping((s) => ({ ...s, freight_charges: v }))} />
                  <Plain label="Marine Cover Policy No." value={shipping.marine_cover_policy_number} onChange={(v) => setShipping((s) => ({ ...s, marine_cover_policy_number: v }))} />
                  <Plain label="Letter of Credit No." value={shipping.letter_of_credit_number} onChange={(v) => setShipping((s) => ({ ...s, letter_of_credit_number: v }))} />
                  <div className="md:col-span-2">
                    <Plain label="Special Instructions (to the Freight Forwarder or Carrier)" value={shipping.special_instructions} onChange={(v) => setShipping((s) => ({ ...s, special_instructions: v }))} />
                  </div>
                  <div className="flex items-end gap-6 md:col-span-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={shipping.hazardous_goods} onCheckedChange={(c) => setShipping((s) => ({ ...s, hazardous_goods: !!c }))} />
                      Contains hazardous / dangerous goods
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={shipping.letter_of_credit} onCheckedChange={(c) => setShipping((s) => ({ ...s, letter_of_credit: !!c }))} />
                      Shipment is on a Letter of Credit
                    </label>
                  </div>
                </div>
              )}
            </Section>

            {/* 4. Products */}
            <Section n={4} title="Products">
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm min-w-[760px]">
                  <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left font-medium px-3 py-2.5 min-w-[180px]">Product Code</th>
                      <th className="text-left font-medium px-3 py-2.5 min-w-[180px]">Description of Goods</th>
                      <th className="text-left font-medium px-3 py-2.5">HS Code</th>
                      <th className="text-right font-medium px-3 py-2.5">Quantity</th>
                      <th className="text-left font-medium px-3 py-2.5">Unit of Measurement</th>
                      <th className="text-right font-medium px-3 py-2.5">Unit Price</th>
                      <th className="text-right font-medium px-3 py-2.5">Amount</th>
                      <th className="px-2 py-2.5 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {productRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                          No items yet — click &ldquo;Add another item&rdquo; below.
                        </td>
                      </tr>
                    ) : (
                      productRows.map((row, idx) => {
                        const p = productById(row.product_id);
                        const unitPrice = num(p?.sell_price);
                        const amount = num(row.quantity) * unitPrice;
                        return (
                          <tr key={idx} className="border-t border-border align-top">
                            <td className="px-3 py-2">
                              <Select
                                value={row.product_id || undefined}
                                onValueChange={(v) =>
                                  setProductRows((rows) => rows.map((r, i) => (i === idx ? { ...r, product_id: v } : r)))
                                }
                                disabled={productList.length === 0}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder={productList.length === 0 ? "No products" : "Select"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {productList.map((prod: ProductResponse) => (
                                    <SelectItem key={prod.id} value={prod.id}>
                                      {prod.code}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">{p?.description || "—"}</td>
                            <td className="px-3 py-2 text-muted-foreground">{p?.hs_code || "—"}</td>
                            <td className="px-3 py-2">
                              <Input
                                className="h-9 w-24 ml-auto text-right"
                                inputMode="decimal"
                                placeholder="0"
                                value={row.quantity}
                                onChange={(e) =>
                                  setProductRows((rows) => rows.map((r, i) => (i === idx ? { ...r, quantity: e.target.value } : r)))
                                }
                              />
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">{p?.unit_of_measurement || "—"}</td>
                            <td className="px-3 py-2 text-right text-muted-foreground whitespace-nowrap">
                              {p ? money(unitPrice) : "—"}
                            </td>
                            <td className="px-3 py-2 text-right font-medium whitespace-nowrap">
                              {p ? money(amount) : "—"}
                            </td>
                            <td className="px-2 py-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => setProductRows((rows) => rows.filter((_, i) => i !== idx))}
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 mt-3 text-primary hover:text-primary"
                onClick={() => setProductRows((rows) => [...rows, { product_id: "", quantity: "" }])}
              >
                <Plus className="h-3.5 w-3.5" /> Add another item
              </Button>
            </Section>

            {/* Additional Charges & Discounts */}
            <section className="border-t border-border pt-8">
              <h2 className="text-base font-semibold mb-5">Additional Charges &amp; Discounts</h2>
              <div className="grid lg:grid-cols-2 gap-x-12 gap-y-6">
                {/* Left: charge lines + tax */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    {chargeLines.map((line, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          className="flex-1"
                          placeholder="Add charge or discount (-)"
                          value={line.name}
                          onChange={(e) =>
                            setChargeLines((ls) => ls.map((l, i) => (i === idx ? { ...l, name: e.target.value } : l)))
                          }
                        />
                        <Affix symbol="₹" className="w-32">
                          <Input
                            className="pl-7 text-right"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={line.amount}
                            onChange={(e) =>
                              setChargeLines((ls) => ls.map((l, i) => (i === idx ? { ...l, amount: e.target.value } : l)))
                            }
                          />
                        </Affix>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive disabled:opacity-30"
                          disabled={chargeLines.length === 1}
                          onClick={() =>
                            setChargeLines((ls) => (ls.length === 1 ? ls : ls.filter((_, i) => i !== idx)))
                          }
                          aria-label="Remove line"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-primary hover:text-primary"
                    onClick={() => setChargeLines((ls) => [...ls, { name: "", amount: "" }])}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add another line
                  </Button>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <Plain label="Tax Name" value={taxName} onChange={setTaxName} placeholder="E.g. GST, VAT" />
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Rate</label>
                      <Affix symbol="%">
                        <Input
                          className="pl-7 text-right"
                          inputMode="decimal"
                          placeholder="18.00"
                          value={taxRate}
                          onChange={(e) => setTaxRate(e.target.value)}
                        />
                      </Affix>
                    </div>
                  </div>
                </div>

                {/* Right: live totals */}
                <div className="space-y-1 self-start">
                  <TotalRow label="Subtotal" value={money(subtotal)} />
                  <TotalRow label="Additional Charges" value={money(chargesTotal)} />
                  <TotalRow label={taxName ? `${taxName} (${rate}%)` : `Tax (${rate}%)`} value={money(taxAmount)} />
                  <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3 mt-2">
                    <span className="text-sm font-semibold">Total Amount</span>
                    <span className="text-base font-semibold">{money(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-base font-semibold mb-4 pb-2 border-b border-border">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Loading() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading reference data...
    </div>
  );
}

function Text({
  form,
  name,
  label,
  placeholder,
  disabled,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  name: keyof FormValues;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const error = form.formState.errors[name]?.message as string | undefined;
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" dangerouslySetInnerHTML={{ __html: label }} />
      <Input placeholder={placeholder} disabled={disabled} {...form.register(name)} />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function Pick({
  form,
  name,
  label,
  placeholder = "Select...",
  options,
  disabled,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  name: keyof FormValues;
  label: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  const value = form.watch(name);
  const error = form.formState.errors[name]?.message as string | undefined;
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <Select
        value={value || undefined}
        onValueChange={(v) => form.setValue(name, v, { shouldValidate: true })}
        disabled={disabled || options.length === 0}
      >
        <SelectTrigger>
          <SelectValue placeholder={options.length === 0 ? "No options" : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function Plain({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <Input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Affix({
  symbol,
  className,
  children,
}: {
  symbol: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        {symbol}
      </span>
      {children}
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

function PartyPick({
  label,
  value,
  contacts,
  onChange,
}: {
  label: string;
  value: string;
  contacts: ContactResponse[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1.5">{label}</label>}
      <Select value={value || undefined} onValueChange={onChange} disabled={contacts.length === 0}>
        <SelectTrigger>
          <SelectValue placeholder={contacts.length === 0 ? "No contacts yet" : "Find or add a contact"} />
        </SelectTrigger>
        <SelectContent>
          {contacts.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.company_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
