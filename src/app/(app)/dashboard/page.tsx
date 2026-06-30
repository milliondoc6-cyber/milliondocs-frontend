"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Topbar } from "@/components/layout/topbar";
import {
  ArrowUpRight,
  Package,
  FileText,
  Users,
  Boxes,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NewShipmentQuickAction,
} from "@/components/shipments/new-shipment-button";
import { api } from "@/lib/api";
import { fetchStoredShipments } from "@/lib/data/shipment-store";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const shipmentsQuery = useQuery({
    queryKey: ["shipments-local"],
    queryFn: fetchStoredShipments,
  });
  const productsQuery = useQuery({
    queryKey: ["products", 1, ""],
    queryFn: () => api.products.list(1),
  });
  const contactsQuery = useQuery({
    queryKey: ["contacts"],
    queryFn: () => api.contacts.list(),
  });

  const shipments = shipmentsQuery.data ?? [];
  const totalShipments = shipments.length;
  const activeShipments = shipments.filter((s) => s.is_active).length;
  const totalProducts = productsQuery.data?.total ?? 0;
  const totalContacts = contactsQuery.data?.length ?? 0;

  const stats = [
    { label: "Total shipments", value: totalShipments, icon: Package, tone: "text-primary" },
    { label: "Active shipments", value: activeShipments, icon: CheckCircle2, tone: "text-emerald" },
    { label: "Products", value: totalProducts, icon: Boxes, tone: "text-foreground" },
    { label: "Contacts", value: totalContacts, icon: Users, tone: "text-foreground" },
  ];

  return (
    <>
      <Topbar title="Dashboard" subtitle="Overview of your export operations" />
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {s.label}
                </span>
                <s.icon className={cn("h-4 w-4", s.tone)} />
              </div>
              <div className="text-3xl font-semibold tracking-tight mt-3">
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Recent shipments</h2>
                <p className="text-xs text-muted-foreground">
                  Latest activity across your workspace
                </p>
              </div>
              <Link href="/shipments">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {shipmentsQuery.isLoading ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : shipments.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No shipments yet.
                </div>
              ) : (
                shipments.slice(0, 5).map((s) => (
                  <Link
                    key={s.id}
                    href={`/shipments/${s.id}`}
                    className="flex items-center px-5 py-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-medium">
                          {s.shipment_reference}
                        </span>
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
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {s.port_of_loading?.value || "—"} →{" "}
                        {s.port_of_discharge?.value || "—"}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium">{s.incoterm?.value || "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        Inv {s.invoice_number}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <h2 className="text-sm font-semibold">Quick actions</h2>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <NewShipmentQuickAction />
                <QuickAction icon={Users} label="Add contact" href="/contacts" />
                <QuickAction icon={Boxes} label="Add product" href="/products" />
                <QuickAction icon={FileText} label="Documents" href="/documents" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function QuickAction({
  icon: Icon,
  label,
  href,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-start gap-2 p-3 rounded-lg border border-border hover:border-emerald/50 hover:bg-emerald/5 transition-colors text-left cursor-pointer"
    >
      <Icon className="h-4 w-4 text-emerald" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
