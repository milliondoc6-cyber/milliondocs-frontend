import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Edit3, Copy, Trash2 } from "lucide-react";
import * as React from "react";

const templates = [
  { name: "Commercial Invoice — Default", desc: "Standard MillionDocs invoice template", updated: "2026-04-12", default: true },
  { name: "Packing List — Default", desc: "Itemised packing list with carton dimensions", updated: "2026-04-12", default: true },
  { name: "Bill of Lading Draft", desc: "Draft BL ready for forwarder review", updated: "2026-03-22" },
  { name: "Certificate of Origin (FORM A)", desc: "GSP-eligible exports", updated: "2026-02-08" },
  { name: "Mehta Exports — Branded Invoice", desc: "Custom logo + green brand color", updated: "2026-05-01" },
  { name: "VGM Declaration", desc: "Verified gross mass per SOLAS", updated: "2026-01-19" },
];

export default function TemplatesPage() {
  return (
    <>
      <Topbar title="Templates" subtitle="Reusable document templates with your branding" />
      <main className="flex-1 p-6 lg:p-8 space-y-5 overflow-auto">
        <div className="flex justify-end">
          <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> New template</Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.name} className="rounded-xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)]">
              <div className="aspect-[4/3] bg-gradient-to-br from-muted to-secondary flex items-center justify-center border-b border-border">
                <div className="bg-card rounded shadow-[var(--shadow-soft)] w-3/4 aspect-[3/4] p-3 flex flex-col gap-1.5">
                  <div className="h-3 w-1/3 bg-emerald/30 rounded-sm" />
                  <div className="h-1.5 w-full bg-muted rounded-sm mt-2" />
                  <div className="h-1.5 w-5/6 bg-muted rounded-sm" />
                  <div className="h-1.5 w-4/6 bg-muted rounded-sm" />
                  <div className="mt-auto h-8 bg-muted/60 rounded-sm" />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-muted-foreground" />{t.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
                  </div>
                  {t.default && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald/15 text-emerald font-medium uppercase">Default</span>}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">Updated {t.updated}</span>
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Edit template"><Edit3 className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Copy template"><Copy className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Delete template"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
