import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Check, ArrowRight } from "lucide-react";
import * as React from "react";

const history = [
  { name: "tally_contacts_apr.csv", type: "Contacts", rows: 142, status: "completed", date: "2026-04-22" },
  { name: "tally_invoices_q1.csv", type: "Invoices", rows: 318, status: "completed", date: "2026-04-02" },
  { name: "products_master.csv", type: "Products", rows: 87, status: "partial", date: "2026-03-18" },
];

export default function ImportsPage() {
  return (
    <>
      <Topbar title="Imports" subtitle="Bring in contacts, products and invoices from Tally or CSV" />
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: "Import Contacts", desc: "Upload buyers, suppliers and consignees", count: "142 imported" },
            { title: "Import Products", desc: "Master catalog with HS codes and pricing", count: "87 imported" },
            { title: "Import Invoices", desc: "Past invoices for reference and templates", count: "318 imported" },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <FileSpreadsheet className="h-5 w-5 text-emerald" />
              <div className="font-medium mt-3">{c.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.desc}</div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-muted-foreground">{c.count}</span>
                <Button size="sm" variant="outline" className="gap-1.5"><Upload className="h-3.5 w-3.5" /> Upload</Button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold">Mapping preview</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald/15 text-emerald font-medium uppercase">Ready to import</span>
          </div>
          <p className="text-xs text-muted-foreground mb-5">142 rows detected from <span className="font-mono">tally_contacts_apr.csv</span>. Review the field mapping before importing.</p>
          <div className="space-y-2">
            {[
              ["Company Name", "company"],
              ["Contact Person", "name"],
              ["Email Address", "email"],
              ["GSTIN", "taxId"],
              ["Country", "country"],
              ["Billing Address", "address"],
            ].map(([from, to]) => (
              <div key={from} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3 py-2 border-b border-border last:border-0">
                <div className="text-sm font-mono text-muted-foreground">{from}</div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="text-sm font-mono">{to}</div>
                <Check className="h-4 w-4 text-emerald" />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-5 border-t border-border">
            <Button variant="outline" size="sm">Cancel</Button>
            <Button size="sm">Import 142 contacts</Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-5 py-4 border-b border-border"><h3 className="text-sm font-semibold">Import history</h3></div>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-left font-medium px-5 py-2.5">File</th>
                <th className="text-left font-medium px-5 py-2.5">Type</th>
                <th className="text-right font-medium px-5 py-2.5">Rows</th>
                <th className="text-left font-medium px-5 py-2.5">Status</th>
                <th className="text-left font-medium px-5 py-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.map((h) => (
                <tr key={h.name}>
                  <td className="px-5 py-3 font-mono text-xs">{h.name}</td>
                  <td className="px-5 py-3">{h.type}</td>
                  <td className="px-5 py-3 text-right">{h.rows}</td>
                  <td className="px-5 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${h.status === "completed" ? "bg-emerald/15 text-emerald" : "bg-accent text-accent-foreground"}`}>{h.status}</span></td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{h.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
