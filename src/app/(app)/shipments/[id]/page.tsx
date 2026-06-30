"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Download,
  Sparkles,
  Anchor,
  Truck,
  AlertCircle,
  Pencil,
  Trash2,
  Plus,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api, getErrorMessage } from "@/lib/api";
import { getBundle, updateBundle, removeShipmentId, type ShipmentBundle } from "@/lib/data/shipment-store";
import { EditShipmentDialog } from "@/components/shipments/edit-shipment-dialog";
import { EditPartiesDialog } from "@/components/shipments/edit-parties-dialog";
import { EditShippingDialog } from "@/components/shipments/edit-shipping-dialog";
import { EditProductsDialog } from "@/components/shipments/edit-products-dialog";
import { EditChargesDialog } from "@/components/shipments/edit-charges-dialog";
import { SelectDocumentSetDialog } from "@/components/shipments/select-document-set-dialog";
import { MASTER_FILE_LABEL } from "@/lib/data/document-sets";

const TABS = ["Overview", "Parties", "Products", "Shipping", "Charges", "Documents"] as const;

export default function ShipmentDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [tab, setTab] = React.useState<(typeof TABS)[number]>("Overview");

  const [bundle, setBundle] = React.useState<ShipmentBundle | null>(() => (id ? getBundle(id) : null));
  const [editShipment, setEditShipment] = React.useState(false);
  const [editParties, setEditParties] = React.useState(false);
  const [editShipping, setEditShipping] = React.useState(false);
  const [editProducts, setEditProducts] = React.useState(false);
  const [editCharges, setEditCharges] = React.useState(false);
  const [editDocs, setEditDocs] = React.useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => api.shipments.delete(id),
    onSuccess: () => {
      toast.success("Shipment deleted");
      removeShipmentId(id);
      router.push("/shipments");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const { data: ship, isLoading, error } = useQuery({
    queryKey: ["shipment", id],
    queryFn: () => api.shipments.get(id),
    enabled: !!id,
  });

  const contactsQuery = useQuery({
    queryKey: ["contacts"],
    queryFn: () => api.contacts.list(),
    enabled: !!bundle?.partyId,
  });

  const partyQuery = useQuery({
    queryKey: ["party", bundle?.partyId],
    queryFn: () => api.parties.get(bundle!.partyId!),
    enabled: !!bundle?.partyId,
  });

  const productsQuery = useQuery({
    queryKey: ["product-details", bundle?.productDetailIds],
    queryFn: () => Promise.all((bundle!.productDetailIds ?? []).map((pid) => api.productDetails.get(pid))),
    enabled: !!bundle?.productDetailIds?.length,
  });

  const shippingQuery = useQuery({
    queryKey: ["shipping-details", bundle?.shippingDetailsId],
    queryFn: () => api.shippingDetails.get(bundle!.shippingDetailsId!),
    enabled: !!bundle?.shippingDetailsId,
  });

  const chargesQuery = useQuery({
    queryKey: ["additional-charges", bundle?.masterFileId],
    queryFn: () => api.additionalCharges.getByMasterFile(bundle!.masterFileId!),
    enabled: !!bundle?.masterFileId,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Loading shipment from backend...
      </div>
    );
  }

  if (error || !ship) {
    return (
      <>
        <Topbar title="Shipment" />
        <main className="flex-1 p-6 lg:p-8">
          <Link
            href="/shipments"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-3 w-3" /> Back to shipments
          </Link>
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <AlertCircle className="h-4 w-4" />
            <span>{error ? getErrorMessage(error) : "Shipment not found."}</span>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar
        title={ship.shipment_reference}
        subtitle={`Invoice ${ship.invoice_number} · ${ship.port_of_loading?.value || "—"} → ${ship.port_of_discharge?.value || "—"}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditShipment(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={() => {
                if (confirm("Delete this shipment? This cannot be undone.")) deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
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

      <div className="px-6 lg:px-8 pt-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={cn(
              "text-xs px-2.5 py-1 rounded-full font-medium",
              ship.is_active
                ? "bg-emerald/15 text-emerald"
                : "bg-muted text-muted-foreground"
            )}
          >
            {ship.is_active ? "Active" : "Inactive"}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-muted font-medium">
            {ship.incoterm?.value || "—"}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-muted font-medium flex items-center gap-1">
            <Truck className="h-3 w-3" /> {ship.dispatch_method?.value || "—"}
          </span>
        </div>
      </div>

      <div className="px-6 lg:px-8 mt-5 border-b border-border">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors cursor-pointer",
                tab === t
                  ? "border-emerald text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {tab === "Overview" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card title="Shipment details">
              <Field label="Shipment reference" value={ship.shipment_reference} mono />
              <Field label="Invoice number" value={ship.invoice_number} mono />
              <Field label="Buyer's reference" value={ship.buyers_reference || "—"} />
              <Field label="Incoterm" value={`${ship.incoterm?.value || "—"} · ${ship.incoterm_place}`} />
              <Field label="Type of shipment" value={ship.shipment_type?.value || "—"} />
              <Field label="Dispatch method" value={ship.dispatch_method?.value || "—"} icon={Truck} />
              <Field label="Pre-carriage by" value={ship.pre_carriage_by?.value || "—"} />
            </Card>

            <Card title="Route">
              <Field label="Port of loading" value={ship.port_of_loading?.value || "—"} icon={Anchor} />
              <Field label="Port of discharge" value={ship.port_of_discharge?.value || "—"} icon={Anchor} />
              <Field label="Origin country" value={ship.origin_country?.value || "—"} />
              <Field label="Destination country" value={ship.destination_country?.value || "—"} />
              <Field label="Place of receipt" value={ship.place_of_receipt || "—"} />
              <Field label="Final destination" value={ship.final_destination || "—"} />
              <Field
                label="Created"
                value={new Date(ship.created_at).toLocaleDateString()}
              />
            </Card>
          </div>
        )}

        {tab === "Parties" && (
          !bundle?.partyId ? (
            <EmptyTab message="No parties were linked to this shipment." />
          ) : partyQuery.isLoading || contactsQuery.isLoading ? (
            <LoadingTab />
          ) : partyQuery.error ? (
            <EmptyTab message={getErrorMessage(partyQuery.error)} />
          ) : (
            <Card
              title="Parties"
              action={
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditParties(true)}>
                  <Pencil className="h-3 w-3" /> Edit
                </Button>
              }
            >
              {(() => {
                const p = partyQuery.data!;
                const contacts = contactsQuery.data ?? [];
                const name = (cid: string) => contacts.find((c) => c.id === cid)?.company_name ?? cid;
                return (
                  <>
                    <Field label="Exporter" value={name(p.exporter_contact_id)} />
                    <Field label="Consignee" value={name(p.consignee_contact_id)} />
                    <Field label="Buyer" value={name(p.buyer_contact_id)} />
                    <Field label="Logistics provider" value={name(p.logistics_provider_contact_id)} />
                    <Field label="Notify party" value={name(p.notify_party_contact_id)} />
                  </>
                );
              })()}
            </Card>
          )
        )}
        {tab === "Products" && (
          !bundle?.productDetailIds?.length ? (
            <div className="space-y-4">
              <EmptyTab message="No product line items were added to this shipment." />
              {bundle?.masterFileId && (
                <div className="text-center">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditProducts(true)}>
                    <Plus className="h-3.5 w-3.5" /> Add products
                  </Button>
                </div>
              )}
            </div>
          ) : productsQuery.isLoading ? (
            <LoadingTab />
          ) : productsQuery.error ? (
            <EmptyTab message={getErrorMessage(productsQuery.error)} />
          ) : (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditProducts(true)}>
                  <Pencil className="h-3 w-3" /> Edit products
                </Button>
              </div>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">Code</th>
                    <th className="text-left font-medium px-4 py-2.5">Description</th>
                    <th className="text-right font-medium px-4 py-2.5">Unit price</th>
                    <th className="text-right font-medium px-4 py-2.5">Qty</th>
                    <th className="text-right font-medium px-4 py-2.5">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(productsQuery.data ?? []).map((pd) => (
                    <tr key={pd.id} className="border-t border-border">
                      <td className="px-4 py-2.5 font-mono">{pd.product_code}</td>
                      <td className="px-4 py-2.5">{pd.description || "—"}</td>
                      <td className="px-4 py-2.5 text-right">{pd.unit_price ?? "—"}</td>
                      <td className="px-4 py-2.5 text-right">{pd.quantity}</td>
                      <td className="px-4 py-2.5 text-right">{pd.amount ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )
        )}
        {tab === "Shipping" && (
          !bundle?.shippingDetailsId ? (
            <EmptyTab message="No shipping details were added to this shipment." />
          ) : shippingQuery.isLoading ? (
            <LoadingTab />
          ) : shippingQuery.error ? (
            <EmptyTab message={getErrorMessage(shippingQuery.error)} />
          ) : (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditShipping(true)}>
                  <Pencil className="h-3 w-3" /> Edit shipping
                </Button>
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
              <Card title="Transport">
                <Field label="ETD" value={shippingQuery.data!.etd} />
                <Field label="ETA" value={shippingQuery.data!.eta} />
                <Field label="Vessel / aircraft / vehicle" value={shippingQuery.data!.vessel_aircraft_vehicle} />
                <Field label="Voyage / flight number" value={shippingQuery.data!.voyage_flight_number} />
                <Field label="Bill of lading number" value={shippingQuery.data!.bill_of_lading_number} />
                <Field label="Export declaration number" value={shippingQuery.data!.export_declaration_number} />
              </Card>
              <Card title="Charges & instructions">
                <Field label="Freight charges" value={shippingQuery.data!.freight_charges} />
                <Field label="Marine cover policy" value={shippingQuery.data!.marine_cover_policy_number} />
                <Field label="Hazardous goods" value={shippingQuery.data!.hazardous_goods ? "Yes" : "No"} />
                <Field label="Letter of credit" value={shippingQuery.data!.letter_of_credit ? "Yes" : "No"} />
                <Field label="LC number" value={shippingQuery.data!.letter_of_credit_number || "—"} />
                <Field label="Document instructions" value={shippingQuery.data!.document_instructions} />
                <Field label="Special instructions" value={shippingQuery.data!.special_instructions || "—"} />
              </Card>
              </div>
            </div>
          )
        )}
        {tab === "Charges" && (
          !bundle?.masterFileId ? (
            <EmptyTab message="No master file linked to this shipment." />
          ) : chargesQuery.isLoading ? (
            <LoadingTab />
          ) : chargesQuery.error || !chargesQuery.data ? (
            <div className="space-y-4">
              <EmptyTab message="No additional charges for this shipment yet." />
              <div className="text-center">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditCharges(true)}>
                  <Plus className="h-3.5 w-3.5" /> Add charges
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditCharges(true)}>
                  <Pencil className="h-3 w-3" /> Edit charges
                </Button>
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <Card title="Charge lines">
                  {chargesQuery.data.charges.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No charge lines.</p>
                  ) : (
                    chargesQuery.data.charges.map((c) => (
                      <Field key={c.id} label={c.name} value={c.amount} />
                    ))
                  )}
                </Card>
                <Card title="Totals">
                  <Field label="Subtotal" value={chargesQuery.data.subtotal} />
                  <Field label="Additional charges" value={chargesQuery.data.additional_charges_total} />
                  <Field
                    label={`Tax${chargesQuery.data.tax_name ? ` (${chargesQuery.data.tax_name} ${chargesQuery.data.tax_rate ?? ""}%)` : ""}`}
                    value={chargesQuery.data.tax_amount}
                  />
                  <Field label="Total" value={chargesQuery.data.total_amount} />
                </Card>
              </div>
            </div>
          )
        )}
        {tab === "Documents" && (
          <Card
            title="Document set"
            action={
              <Button variant="outline" size="sm" onClick={() => setEditDocs(true)}>
                {bundle?.documentSetNames?.length ? (
                  <>
                    <Pencil className="h-3.5 w-3.5" /> Edit documents
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" /> Add documents
                  </>
                )}
              </Button>
            }
          >
            <ul className="divide-y divide-border">
              <li className="flex items-center gap-3 py-2.5">
                <FileText className="h-4 w-4 text-emerald" />
                <span className="text-sm font-medium">{MASTER_FILE_LABEL}</span>
                <span className="ml-auto text-xs text-muted-foreground">Always included</span>
              </li>
              {(bundle?.documentSetNames ?? []).map((name) => (
                <li key={name} className="flex items-center gap-3 py-2.5">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{name}</span>
                </li>
              ))}
            </ul>
            {!bundle?.documentSetNames?.length && (
              <p className="text-xs text-muted-foreground mt-3">
                No documents selected yet. Click &ldquo;Add documents&rdquo; to choose a set.
              </p>
            )}
          </Card>
        )}
      </main>

      {ship && (
        <EditShipmentDialog shipment={ship} open={editShipment} onOpenChange={setEditShipment} />
      )}
      {partyQuery.data && (
        <EditPartiesDialog party={partyQuery.data} open={editParties} onOpenChange={setEditParties} />
      )}
      {shippingQuery.data && (
        <EditShippingDialog
          shipping={shippingQuery.data}
          open={editShipping}
          onOpenChange={setEditShipping}
          onDeleted={() => setBundle((b) => (b ? { ...updateBundle(id, { shippingDetailsId: undefined })! } : b))}
        />
      )}
      {bundle?.masterFileId && (
        <EditProductsDialog
          masterFileId={bundle.masterFileId}
          existing={productsQuery.data ?? []}
          open={editProducts}
          onOpenChange={setEditProducts}
          onChanged={(ids) =>
            setBundle((b) => (b ? { ...updateBundle(id, { productDetailIds: ids })! } : b))
          }
        />
      )}
      {bundle?.masterFileId && (
        <EditChargesDialog
          masterFileId={bundle.masterFileId}
          existing={chargesQuery.data}
          open={editCharges}
          onOpenChange={setEditCharges}
        />
      )}
      <SelectDocumentSetDialog
        open={editDocs}
        onOpenChange={setEditDocs}
        initialSelected={bundle?.documentSetNames ?? []}
        confirmLabel="Save documents"
        onConfirm={(names) => {
          setBundle((b) => (b ? { ...updateBundle(id, { documentSetNames: names })! } : b));
          setEditDocs(false);
          toast.success("Documents updated");
        }}
      />
    </>
  );
}

function Card({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  mono,
  icon: Icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 py-2 border-b border-border last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("col-span-2 flex items-center gap-1.5", mono && "font-mono")}>
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {value}
      </span>
    </div>
  );
}

function EmptyTab({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-sm text-muted-foreground border border-dashed rounded-xl border-border max-w-2xl mx-auto">
      {message}
    </div>
  );
}

function LoadingTab() {
  return (
    <div className="text-center py-16 text-sm text-muted-foreground">
      Loading from backend...
    </div>
  );
}
