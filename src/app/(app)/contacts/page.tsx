"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Upload, Building2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, ContactResponse } from "@/lib/api";
import { toast } from "sonner";

const typeMeta: Record<string, string> = {
  customer: "bg-emerald/15 text-emerald",
  supplier: "bg-primary/10 text-primary",
  forwarding: "bg-muted text-muted-foreground",
  other: "bg-accent text-accent-foreground",
};

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const { data: contactsList = [], isLoading, error } = useQuery<ContactResponse[]>({
    queryKey: ["contacts"],
    queryFn: () => api.contacts.list(),
    meta: {
      onError: (err: any) => {
        toast.error("Failed to load contacts from backend: " + err.message);
      }
    }
  });

  const filteredContacts = contactsList.filter((c) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      c.company_name.toLowerCase().includes(searchLower) ||
      c.primary_person.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower) ||
      c.address.city.toLowerCase().includes(searchLower) ||
      c.address.country.toLowerCase().includes(searchLower);

    if (selectedFilter === "All") return matchesSearch;
    if (selectedFilter === "Buyers") return matchesSearch && c.role === "customer";
    if (selectedFilter === "Suppliers") return matchesSearch && c.role === "supplier";
    // Consignee maps to customer in backend (role values are customer, supplier, forwarding, other)
    if (selectedFilter === "Consignees") return matchesSearch && c.role === "customer";
    if (selectedFilter === "Forwarders") return matchesSearch && c.role === "forwarding";
    return matchesSearch;
  });

  return (
    <>
      <Topbar title="Contacts" subtitle="Reusable parties used across all your shipments" />
      <main className="flex-1 p-6 lg:p-8 space-y-5 overflow-auto">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search company, country, primary contact..." 
              className="pl-9 h-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {["All", "Buyers", "Suppliers", "Consignees", "Forwarders"].map((t) => (
            <Button 
              key={t} 
              variant={selectedFilter === t ? "secondary" : "outline"} 
              size="sm"
              onClick={() => setSelectedFilter(t)}
            >
              {t}
            </Button>
          ))}
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="gap-1.5"><Upload className="h-3.5 w-3.5" /> Import CSV</Button>
          <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> New contact</Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to sync with backend API. Showing offline items if cached.</span>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-sm text-muted-foreground">Loading contacts...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground border border-dashed rounded-xl border-border">
            No contacts found. Click "New contact" or import database.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((c) => (
              <div key={c.id} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] hover:border-emerald/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium uppercase", typeMeta[c.role] || "bg-muted text-muted-foreground")}>
                    {c.role === "customer" ? "buyer/consignee" : c.role}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="font-medium">{c.company_name}</div>
                  <div className="text-xs text-muted-foreground">{c.address.city}, {c.address.country}</div>
                </div>
                <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs">
                  <div className="text-muted-foreground">Contact <span className="text-foreground">{c.primary_person}</span></div>
                  <div className="text-muted-foreground truncate">{c.email}</div>
                  <div className="text-muted-foreground font-mono truncate">
                    {/* TODO: Contact taxId field is missing in backend contacts table/schema. 
                        Need backend support to store GSTIN/VAT/EORI per contact. */}
                    {c.taxId || "— (taxId missing in backend schema)"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
