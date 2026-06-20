import Link from "next/link";
import { Topbar } from "@/components/topbar";
import { shipments, findContact, statusMeta } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from "react";

export default function ShipmentsList() {
  // TODO: The shipments list page is currently mock data because there is no GET /shipments endpoint
  // exposed in backend routers (routers/shipments.py lacks a list route, although services/shipments.py
  // implements list_shipments).
  // Missing backend resources:
  // - GET /shipments route in routers/shipments.py mapping to services.shipments.list_shipments
  return (
    <>
      <Topbar title="Shipments" subtitle={`${shipments.length} active shipments across your workspace`} />
      <main className="flex-1 p-6 lg:p-8 space-y-5 overflow-auto">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by number, buyer, port..." className="pl-9 h-9" />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5"><Filter className="h-3.5 w-3.5" /> Status</Button>
          <Button variant="outline" size="sm" className="gap-1.5"><Filter className="h-3.5 w-3.5" /> Lane</Button>
          <Button variant="outline" size="sm" className="gap-1.5"><Filter className="h-3.5 w-3.5" /> Incoterm</Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Export</Button>
          <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> New shipment</Button>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-left font-medium px-5 py-3">Shipment</th>
                <th className="text-left font-medium px-5 py-3">Buyer</th>
                <th className="text-left font-medium px-5 py-3">Lane</th>
                <th className="text-left font-medium px-5 py-3">Incoterm</th>
                <th className="text-left font-medium px-5 py-3">ETD / ETA</th>
                <th className="text-right font-medium px-5 py-3">Value</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shipments.map((s) => {
                const buyer = findContact(s.buyerId);
                const meta = statusMeta[s.status];
                return (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/shipments/${s.id}`} className="font-mono font-medium hover:text-emerald">
                        {s.number}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium">{buyer?.company}</div>
                      <div className="text-xs text-muted-foreground">{buyer?.country}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <div>{s.portOfLoading.split(" - ")[1]}</div>
                      <div className="text-muted-foreground">→ {s.portOfDischarge.split(" - ")[1]}</div>
                    </td>
                    <td className="px-5 py-3.5"><span className="text-xs font-medium px-2 py-0.5 rounded bg-muted">{s.incoterm}</span></td>
                    <td className="px-5 py-3.5 text-xs">
                      <div>{s.etd}</div>
                      <div className="text-muted-foreground">{s.eta}</div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium">{s.currency} {s.totalValue.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap", meta.tone)}>{meta.label}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Shipment actions"><MoreHorizontal className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-5 py-3 border-t border-border text-xs text-muted-foreground">
            <span>Showing 1–{shipments.length} of {shipments.length}</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 px-2.5">Previous</Button>
              <Button variant="outline" size="sm" className="h-7 px-2.5">Next</Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
