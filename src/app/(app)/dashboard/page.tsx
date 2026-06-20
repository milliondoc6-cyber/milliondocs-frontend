import Link from "next/link";
import { Topbar } from "@/components/topbar";
import { ArrowUpRight, Package, FileText, Clock, CheckCircle2, AlertTriangle, Plus, FileCheck2, Users, Boxes } from "lucide-react";
import { shipments, findContact, statusMeta } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as React from "react";

export default function DashboardPage() {
  // TODO: The following dashboard statistics and activity metrics are currently mock data 
  // because the backend is missing aggregation routes and tables.
  // Missing backend resources:
  // - Dashboard stats aggregation route
  // - GET /shipments list route (service list_shipments exists but is not routed)
  // - Activity log / audit trail database table and model
  const totalShipments = shipments.length;
  const inTransit = shipments.filter((s) => s.status === "in_transit").length;
  const delayed = shipments.filter((s) => s.status === "delayed").length;
  const pendingDocs = shipments.flatMap((s) => s.documents).filter((d) => d.status === "draft").length;
  const generated = shipments.flatMap((s) => s.documents).filter((d) => d.status !== "draft").length;

  const stats = [
    { label: "Total shipments", value: totalShipments, sub: "+8 this month", icon: Package, tone: "text-primary" },
    { label: "In transit", value: inTransit, sub: "Across 4 lanes", icon: Clock, tone: "text-emerald" },
    { label: "Pending documents", value: pendingDocs, sub: "Need review", icon: FileText, tone: "text-foreground" },
    { label: "Documents generated", value: generated, sub: "Last 30 days", icon: FileCheck2, tone: "text-emerald" },
  ];

  const recentActivity = shipments.flatMap((s) => s.activity.map((a) => ({ ...a, ship: s.number }))).slice(0, 6);

  return (
    <>
      <Topbar title="Dashboard" subtitle="Overview of your export operations" />
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
                <s.icon className={cn("h-4 w-4", s.tone)} />
              </div>
              <div className="text-3xl font-semibold tracking-tight mt-3">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Recent shipments</h2>
                <p className="text-xs text-muted-foreground">Latest activity across your workspace</p>
              </div>
              <Link href="/shipments">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {shipments.slice(0, 5).map((s) => {
                const buyer = findContact(s.buyerId);
                const meta = statusMeta[s.status];
                return (
                  <Link
                    key={s.id}
                    href={`/shipments/${s.id}`}
                    className="flex items-center px-5 py-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-medium">{s.number}</span>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", meta.tone)}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {buyer?.company} · {s.portOfLoading.split(" - ")[1]} → {s.portOfDischarge.split(" - ")[1]}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium">
                        {s.currency} {s.totalValue.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">ETA {s.eta}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <h2 className="text-sm font-semibold">Quick actions</h2>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <QuickAction icon={Plus} label="New shipment" />
                <QuickAction icon={FileText} label="Generate doc" />
                <QuickAction icon={Users} label="Add contact" />
                <QuickAction icon={Boxes} label="Add product" />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <h2 className="text-sm font-semibold">Status overview</h2>
              <div className="space-y-3 mt-4">
                <StatusBar
                  label="In transit"
                  count={inTransit}
                  total={totalShipments}
                  icon={Clock}
                  tone="bg-emerald"
                />
                <StatusBar
                  label="Delivered"
                  count={shipments.filter((s) => s.status === "delivered").length}
                  total={totalShipments}
                  icon={CheckCircle2}
                  tone="bg-primary"
                />
                <StatusBar
                  label="Delayed"
                  count={delayed}
                  total={totalShipments}
                  icon={AlertTriangle}
                  tone="bg-destructive"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Recent activity</h2>
          </div>
          <div className="divide-y divide-border">
            {recentActivity.map((a) => (
              <div key={a.id} className="px-5 py-3 flex items-center text-sm">
                <div className="h-7 w-7 rounded-full bg-emerald/10 text-emerald flex items-center justify-center text-[11px] font-medium mr-3">
                  {a.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <span className="font-medium">{a.user}</span> <span className="text-muted-foreground">{a.action}</span>{" "}
                  <span className="font-mono text-xs text-muted-foreground">· {a.ship}</span>
                </div>
                <div className="text-xs text-muted-foreground">{a.at}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

function QuickAction({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button className="flex flex-col items-start gap-2 p-3 rounded-lg border border-border hover:border-emerald/50 hover:bg-emerald/5 transition-colors text-left cursor-pointer">
      <Icon className="h-4 w-4 text-emerald" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function StatusBar({ label, count, total, icon: Icon, tone }: any) {
  const pct = (count / total) * 100;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          {label}
        </span>
        <span className="font-medium">{count}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full", tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
