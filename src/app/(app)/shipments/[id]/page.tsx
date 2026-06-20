"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Topbar } from "@/components/topbar";
import { findShipment, findContact, findProduct, statusMeta } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText, Download, Sparkles, Plus, Anchor, Truck, Package2, Upload, History, FileCheck2, Eye, Copy, MoreVertical, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import * as React from "react";

const TABS = ["Overview", "Parties", "Products", "Containers", "Documents", "Files", "Activity"] as const;

export default function ShipmentDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [tab, setTab] = useState<typeof TABS[number]>("Overview");

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id || "");

  const { data: backendShipment, isLoading, error } = useQuery({
    queryKey: ["shipment", id],
    queryFn: () => api.shipments.get(id),
    enabled: isUuid,
  });

  const mockShip = findShipment(id);

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading shipment from backend...</div>;
  }

  // Resolve shipment data: Backend active record vs Mock offline record
  let ship: any = null;
  let isBackendSynced = false;

  if (backendShipment) {
    isBackendSynced = true;
    ship = {
      id: backendShipment.id,
      number: backendShipment.shipment_reference,
      invoice_number: backendShipment.invoice_number,
      incoterm: backendShipment.incoterm?.value || "FOB",
      dispatchMethod: backendShipment.dispatch_method?.value || "Sea",
      portOfLoading: backendShipment.port_of_loading?.value || "—",
      portOfDischarge: backendShipment.port_of_discharge?.value || "—",
      // TODO: ShipmentInformation does not directly contain ETD/ETA.
      // These are defined in the separate ShippingDetails table.
      etd: backendShipment.created_at ? new Date(backendShipment.created_at).toISOString().split('T')[0] : "—",
      eta: "— (Requires ShippingDetails link)",
      
      // TODO: Status field is missing on the ShipmentInformation model in FastAPI backend database
      status: "draft",
      
      // TODO: Products and Total Value calculations are mock since there is no shipment_items mapping table in the backend
      totalValue: 0,
      currency: "USD",
      items: [],
      containers: [],
      documents: [],
      files: [],
      activity: [],
      buyerId: "",
      supplierId: "",
    };
  } else if (mockShip) {
    ship = mockShip;
  }

  if (!ship) return <div className="p-8">Shipment not found.</div>;
  
  const buyer = findContact(ship.buyerId);
  const supplier = findContact(ship.supplierId);
  const consignee = findContact(ship.consigneeId);
  const forwarder = findContact(ship.forwarderId);
  const meta = statusMeta[ship.status as keyof typeof statusMeta] || statusMeta.draft;

  // Formats address string nicely for display whether it is a string or ContactAddress object
  const formatAddress = (c: any) => {
    if (!c) return "—";
    if (typeof c.address === "string") return c.address;
    if (c.address && typeof c.address === "object") {
      return `${c.street_address || ""}, ${c.address.city || ""}, ${c.address.country || ""}`;
    }
    return c.street_address || "—";
  };

  return (
    <>
      <Topbar
        title={ship.number}
        subtitle={`${buyer?.company_name || "New Shipment"} · ${ship.portOfLoading} → ${ship.portOfDischarge}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            <Button size="sm" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Generate documents
            </Button>
          </div>
        }
      />
      <div className="px-6 lg:px-8 pt-4">
        <Link
          href="/shipments"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3 w-3" /> Back to shipments
        </Link>
      </div>

      <div className="px-6 lg:px-8 pt-3 space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", meta.tone)}>{meta.label}</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-muted font-medium">{ship.incoterm}</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-muted font-medium flex items-center gap-1">
            <Truck className="h-3 w-3" /> {ship.dispatchMethod}
          </span>
          <span className="text-xs text-muted-foreground font-normal">
            Total <span className="font-medium text-foreground">{ship.currency} {ship.totalValue.toLocaleString()}</span>
          </span>
        </div>

        {isBackendSynced && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 rounded-lg p-3">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              Connected to backend shipment route (`/shipments/{id}`). 
              Note: Items, containers, documents, files, and activity logs are temporarily disabled as the database schemas do not yet have corresponding tables.
            </span>
          </div>
        )}
      </div>

      <div className="px-6 lg:px-8 mt-5 border-b border-border">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors cursor-pointer",
                tab === t ? "border-emerald text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {tab === "Overview" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card title="Shipment details">
                <Field label="Shipment reference" value={ship.number} mono />
                {ship.invoice_number && <Field label="Invoice number" value={ship.invoice_number} mono />}
                <Field label="Incoterm" value={ship.incoterm} />
                <Field label="Dispatch method" value={ship.dispatchMethod} />
                <Field label="Currency" value={ship.currency} />
                <Field label="Port of loading" value={ship.portOfLoading} icon={Anchor} />
                <Field label="Port of discharge" value={ship.portOfDischarge} icon={Anchor} />
                <Field label="ETD" value={ship.etd} />
                <Field label="ETA" value={ship.eta} />
              </Card>

              <Card
                title="Items"
                right={
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Plus className="h-3.5 w-3.5" />Add product
                  </Button>
                }
              >
                {/* TODO: Create shipment_items model in backend for mapping products to shipment. */}
                {ship.items.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    No products added. (Items mapping table is missing in backend API)
                  </div>
                ) : (
                  <div className="-mx-5 -mb-5">
                    <table className="w-full text-sm">
                      <thead className="text-xs text-muted-foreground uppercase tracking-wider border-y border-border bg-muted/30">
                        <tr>
                          <th className="text-left font-medium px-5 py-2.5">Product</th>
                          <th className="text-left font-medium px-5 py-2.5">HS Code</th>
                          <th className="text-right font-medium px-5 py-2.5">Qty</th>
                          <th className="text-right font-medium px-5 py-2.5">Unit price</th>
                          <th className="text-right font-medium px-5 py-2.5">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {ship.items.map((it: any, i: number) => {
                          const p = findProduct(it.productId);
                          if (!p) return null;
                          return (
                            <tr key={i}>
                              <td className="px-5 py-3">
                                <div className="font-medium">{p.description}</div>
                                <div className="text-xs text-muted-foreground font-mono">{p.code}</div>
                              </td>
                              <td className="px-5 py-3 font-mono text-xs">{p.hs_code || "—"}</td>
                              <td className="px-5 py-3 text-right">{it.quantity.toLocaleString()} {p.unit_of_measurement}</td>
                              <td className="px-5 py-3 text-right">{(p.custom_fields?.currency || "USD")} {(p.sell_price || 0).toFixed(2)}</td>
                              <td className="px-5 py-3 text-right font-medium">
                                {(p.custom_fields?.currency || "USD")}{" "}
                                {(it.quantity * (p.sell_price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <Card
                title="Autofill summary"
                right={
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald/15 text-emerald font-medium">AUTO</span>
                }
              >
                <p className="text-xs text-muted-foreground -mt-1 mb-3">Master data flowing into this shipment.</p>
                <AutofillRow label="Buyer" name={buyer?.company_name} sub={buyer?.taxId} />
                <AutofillRow label="Supplier" name={supplier?.company_name} sub={supplier?.taxId} />
                <AutofillRow label="Consignee" name={consignee?.company_name || "Same as buyer"} sub={consignee?.taxId} />
                <AutofillRow label="Forwarder" name={forwarder?.company_name || "—"} sub={forwarder?.address?.country} />
              </Card>

              <Card title="Timeline">
                <ol className="relative border-l border-border ml-2 space-y-4 pl-5">
                  <TimelineDot label="Booking confirmed" date="2026-04-28" done />
                  <TimelineDot label="Cargo ready" date="2026-05-01" done />
                  <TimelineDot label="Loaded on vessel" date="2026-05-02" done />
                  <TimelineDot label="In transit" date="2026-05-04" active />
                  <TimelineDot label="Arrived at destination" date={ship.eta} />
                </ol>
              </Card>

              <Card title="Notes">
                <p className="text-sm text-muted-foreground">
                  {ship.notes || "Buyer requested split BL with original to bank. Insurance under buyer's open policy."}
                </p>
              </Card>
            </div>
          </div>
        )}

        {tab === "Parties" && (
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: "Buyer", data: buyer },
              { label: "Supplier", data: supplier },
              { label: "Consignee", data: consignee },
              { label: "Forwarder", data: forwarder }
            ].filter(p => p.data).map((p) => (
              <Card key={p.data!.id} title={p.label} right={<Button variant="ghost" size="sm">Change</Button>}>
                <div className="font-medium text-base">{p.data!.company_name}</div>
                <div className="text-sm text-muted-foreground mt-1">{formatAddress(p.data)}</div>
                <div className="text-xs text-muted-foreground mt-2">{p.data!.email} · Phone: {p.data!.contact_info}</div>
                <div className="mt-3 text-xs">
                  <span className="text-muted-foreground">Tax ID</span> <span className="font-mono">{p.data!.taxId || "—"}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === "Products" && (
          <Card
            title="Shipment items"
            right={
              <Button size="sm" className="gap-1">
                <Plus className="h-3.5 w-3.5" />Add from catalog
              </Button>
            }
          >
            {/* TODO: Products mapping is missing in backend ShipmentInformation schema. */}
            {ship.items.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                No products cataloged in this shipment. (Database table is missing on backend)
              </div>
            ) : (
              <div className="-mx-5 -mb-5">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground uppercase tracking-wider border-y border-border bg-muted/30">
                    <tr>
                      <th className="text-left font-medium px-5 py-2.5">SKU</th>
                      <th className="text-left font-medium px-5 py-2.5">Product</th>
                      <th className="text-left font-medium px-5 py-2.5">HS</th>
                      <th className="text-right font-medium px-5 py-2.5">Qty</th>
                      <th className="text-right font-medium px-5 py-2.5">Cartons</th>
                      <th className="text-right font-medium px-5 py-2.5">Net wt</th>
                      <th className="text-right font-medium px-5 py-2.5">Gross wt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ship.items.map((it: any, i: number) => {
                      const p = findProduct(it.productId)!;
                      return (
                        <tr key={i}>
                          <td className="px-5 py-3 font-mono text-xs">{p.code}</td>
                          <td className="px-5 py-3 font-medium">{p.description}</td>
                          <td className="px-5 py-3 font-mono text-xs">{p.hs_code || "—"}</td>
                          <td className="px-5 py-3 text-right">{it.quantity}</td>
                          <td className="px-5 py-3 text-right">{it.cartons}</td>
                          <td className="px-5 py-3 text-right">{((p.net_weight_kg || 0) * it.quantity).toFixed(1)} kg</td>
                          <td className="px-5 py-3 text-right">{((p.gross_weight_kg || 0) * it.quantity).toFixed(1)} kg</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {tab === "Containers" && (
          <Card
            title="Containers"
            right={
              <Button size="sm" className="gap-1">
                <Plus className="h-3.5 w-3.5" />Add container
              </Button>
            }
          >
            {/* TODO: Containers table is missing in FastAPI backend */}
            {ship.containers.length === 0 ? (
              <Empty
                icon={Package2}
                title="No containers yet"
                body="Add a container number, type and seal to auto-populate VGM and BL drafts."
              />
            ) : (
              <div className="space-y-2">
                {ship.containers.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                    <Package2 className="h-5 w-5 text-emerald" />
                    <div className="flex-1">
                      <div className="font-mono font-medium">{c.number}</div>
                      <div className="text-xs text-muted-foreground">{c.type} · Seal {c.sealNo}</div>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {tab === "Documents" && (
          <div className="space-y-4">
            <Card
              title="Generated documents"
              right={
                <Button size="sm" className="gap-1">
                  <Sparkles className="h-3.5 w-3.5" />Generate new
                </Button>
              }
            >
              {/* TODO: Documents relation is missing in FastAPI backend database */}
              {ship.documents.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No documents generated yet. (Documents tables/services are missing on backend)
                </div>
              ) : (
                <div className="-mx-5 -mb-5">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-muted-foreground uppercase tracking-wider border-y border-border bg-muted/30">
                      <tr>
                        <th className="text-left font-medium px-5 py-2.5">Document</th>
                        <th className="text-left font-medium px-5 py-2.5">Status</th>
                        <th className="text-left font-medium px-5 py-2.5">Version</th>
                        <th className="text-left font-medium px-5 py-2.5">Updated</th>
                        <th className="px-5 py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {ship.documents.map((d: any) => (
                        <tr key={d.id}>
                          <td className="px-5 py-3 font-normal">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{d.type}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3"><DocStatus status={d.status} /></td>
                          <td className="px-5 py-3 font-mono text-xs">v{d.version}</td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">{d.updatedAt}</td>
                          <td className="px-5 py-3">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Copy className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><History className="h-3.5 w-3.5" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <div className="grid md:grid-cols-3 gap-3">
              {["Commercial Invoice", "Packing List", "Certificate of Origin", "Bill of Lading Draft", "Shipping Instructions", "VGM"].map((t) => (
                <button
                  key={t}
                  className="text-left p-4 rounded-lg border border-border hover:border-emerald/50 hover:bg-emerald/5 transition-colors cursor-pointer"
                >
                  <FileCheck2 className="h-4 w-4 text-emerald mb-2" />
                  <div className="text-sm font-medium">{t}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Generate from this shipment</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "Files" && (
          <Card
            title="Attached files"
            right={
              <Button size="sm" className="gap-1">
                <Upload className="h-3.5 w-3.5" />Upload
              </Button>
            }
          >
            {/* TODO: Attached files table is missing in FastAPI backend */}
            <div className="border border-dashed border-border rounded-lg p-8 text-center text-sm text-muted-foreground mb-4">
              Drag and drop files here, or click to browse
            </div>
            {ship.files.length > 0 && (
              <div className="space-y-2">
                {ship.files.map((f: any) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{f.name}</div>
                      <div className="text-xs text-muted-foreground">{f.size} · {f.uploadedAt}</div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {tab === "Activity" && (
          <Card title="Activity log">
            {/* TODO: Activity log/history audit table is missing in FastAPI backend */}
            {ship.activity.length === 0 ? (
              <div className="text-xs text-muted-foreground">No recent activities documented.</div>
            ) : (
              <ol className="relative border-l border-border ml-2 space-y-5 pl-5">
                {ship.activity.map((a: any) => (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[27px] top-1 h-2.5 w-2.5 rounded-full bg-emerald border-2 border-background" />
                    <div className="text-sm">
                      <span className="font-medium">{a.user}</span> {a.action}
                    </div>
                    <div className="text-xs text-muted-foreground">{a.at}</div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        )}
      </main>
    </>
  );
}

function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, mono, icon: Icon }: { label: string; value: string; mono?: boolean; icon?: any }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-2 border-b border-border last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("col-span-2 flex items-center gap-1.5", mono && "font-mono")}>
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}{value}
      </span>
    </div>
  );
}

function AutofillRow({ label, name, sub }: { label: string; name?: string; sub?: string }) {
  return (
    <div className="py-2.5 border-b border-border last:border-0">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{name || "—"}</div>
      {sub && <div className="text-xs text-muted-foreground font-mono">{sub}</div>}
    </div>
  );
}

function TimelineDot({ label, date, done, active }: { label: string; date: string; done?: boolean; active?: boolean }) {
  return (
    <li className="relative">
      <span
        className={cn(
          "absolute -left-[27px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background",
          done ? "bg-emerald" : active ? "bg-emerald ring-4 ring-emerald/20" : "bg-muted-foreground/30"
        )}
      />
      <div className={cn("text-sm", done || active ? "font-medium" : "text-muted-foreground")}>{label}</div>
      <div className="text-xs text-muted-foreground">{date}</div>
    </li>
  );
}

function DocStatus({ status }: { status: string }) {
  const map: any = {
    draft: "bg-muted text-muted-foreground",
    ready: "bg-emerald/15 text-emerald",
    signed: "bg-primary/10 text-primary",
  };
  return <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium uppercase", map[status] || "bg-muted text-muted-foreground")}>{status}</span>;
}

function Empty({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="text-center py-12">
      <Icon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
      <div className="font-medium">{title}</div>
      <div className="text-sm text-muted-foreground mt-1">{body}</div>
    </div>
  );
}
