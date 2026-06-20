import Link from "next/link";
import { Topbar } from "@/components/topbar";
import { shipments, findContact } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Download, Eye, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from "react";

export default function DocumentsPage() {
  // TODO: Documents page displays mock listings because there is no backend database table or 
  // API endpoints to save, edit, retrieve, or update generated documents in FastAPI.
  // Missing backend resources:
  // - Documents database model (e.g. table "documents")
  // - Document generation and CRUD router endpoints
  const all = shipments.flatMap((s) =>
    s.documents.map((d) => ({
      ...d,
      shipId: s.id,
      shipNumber: s.number,
      buyer: findContact(s.buyerId)?.company,
    }))
  );

  return (
    <>
      <Topbar title="Documents" subtitle={`${all.length} documents across all shipments`} />
      <main className="flex-1 p-6 lg:p-8 space-y-5 overflow-auto">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-9 h-9" />
          </div>
          <Button size="sm" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Generate</Button>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-left font-medium px-5 py-3">Document</th>
                <th className="text-left font-medium px-5 py-3">Shipment</th>
                <th className="text-left font-medium px-5 py-3">Buyer</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-left font-medium px-5 py-3">Version</th>
                <th className="text-left font-medium px-5 py-3">Updated</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {all.map((d) => (
                <tr key={d.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{d.type}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/shipments/${d.shipId}`} className="font-mono hover:text-emerald">
                      {d.shipNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{d.buyer}</td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase",
                        d.status === "draft" && "bg-muted text-muted-foreground",
                        d.status === "ready" && "bg-emerald/15 text-emerald",
                        d.status === "signed" && "bg-primary/10 text-primary"
                      )}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">v{d.version}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{d.updatedAt}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View document">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Download document">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
