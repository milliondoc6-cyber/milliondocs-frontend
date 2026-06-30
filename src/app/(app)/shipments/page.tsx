"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Topbar } from "@/components/layout/topbar";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle, Folder } from "lucide-react";
import { NewShipmentButton } from "@/components/shipments/new-shipment-button";
import { getErrorMessage } from "@/lib/api";
import { fetchStoredShipments } from "@/lib/data/shipment-store";
import { cn } from "@/lib/utils";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ShipmentsList() {
  const [search, setSearch] = React.useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["shipments-local"],
    queryFn: fetchStoredShipments,
  });

  const items = data ?? [];
  const total = items.length;

  const filtered = search
    ? items.filter((s) =>
        [s.shipment_reference, s.invoice_number, s.buyers_reference ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : items;

  return (
    <>
      <Topbar
        title="Shipments"
        subtitle={`${total} shipment${total === 1 ? "" : "s"} in your workspace`}
      />
      <main className="flex-1 p-6 lg:p-8 space-y-5 overflow-auto">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by reference, invoice, buyer..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex-1" />
          <NewShipmentButton className="gap-1.5" />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <AlertCircle className="h-4 w-4" />
            <span>{getErrorMessage(error)}</span>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Loading shipments from backend...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground border border-dashed rounded-xl border-border">
            {total === 0
              ? 'No shipments yet. Click "New shipment" to create your first one.'
              : "No shipments match your search."}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Reference</th>
                  <th className="text-left font-medium px-5 py-3">Invoice</th>
                  <th className="text-left font-medium px-5 py-3">Destination</th>
                  <th className="text-left font-medium px-5 py-3">Date created</th>
                  <th className="text-left font-medium px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/shipments/${s.id}`}
                        className="flex items-center gap-2.5 font-medium hover:text-emerald"
                      >
                        <Folder className="h-4 w-4 text-amber-500 shrink-0 fill-amber-500/20" />
                        <span className="font-mono">{s.shipment_reference}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs">{s.invoice_number}</td>
                    <td className="px-5 py-3.5 text-xs">
                      {s.final_destination || s.destination_country?.value || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {formatDate(s.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-medium",
                          s.is_active
                            ? "bg-emerald/15 text-emerald"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {s.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
              Showing {filtered.length} of {total} shipment{total === 1 ? "" : "s"}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
