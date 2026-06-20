"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Upload, Building2, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, getErrorMessage, type ContactResponse } from "@/lib/api";
import { toast } from "sonner";
import { ContactFormDialog } from "./contact-form-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

const typeMeta: Record<string, string> = {
  customer: "bg-emerald/15 text-emerald",
  supplier: "bg-primary/10 text-primary",
  forwarding: "bg-muted text-muted-foreground",
  other: "bg-accent text-accent-foreground",
};

export default function ContactsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ContactResponse | null>(null);
  const [deleting, setDeleting] = useState<ContactResponse | null>(null);

  const { data: contactsList = [], isLoading, error } = useQuery<ContactResponse[]>({
    queryKey: ["contacts"],
    queryFn: () => api.contacts.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.contacts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact deleted");
      setDeleting(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (c: ContactResponse) => {
    setEditing(c);
    setFormOpen(true);
  };

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
          <Button variant="outline" size="sm" className="gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Import CSV
          </Button>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> New contact
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <AlertCircle className="h-4 w-4" />
            <span>{getErrorMessage(error)}</span>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-sm text-muted-foreground">Loading contacts...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground border border-dashed rounded-xl border-border">
            No contacts found. Click &ldquo;New contact&rdquo; to add one.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((c) => (
              <div
                key={c.id}
                className="group rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] hover:border-emerald/40 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase self-center",
                        typeMeta[c.role] || "bg-muted text-muted-foreground",
                      )}
                    >
                      {c.role === "customer" ? "buyer/consignee" : c.role}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => openEdit(c)}
                      aria-label="Edit contact"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setDeleting(c)}
                      aria-label="Delete contact"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="font-medium">{c.company_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.address.city}, {c.address.country}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs">
                  <div className="text-muted-foreground">
                    Contact <span className="text-foreground">{c.primary_person}</span>
                  </div>
                  <div className="text-muted-foreground truncate">{c.email}</div>
                  <div className="text-muted-foreground font-mono truncate">{c.contact_info}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ContactFormDialog open={formOpen} onOpenChange={setFormOpen} contact={editing} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete contact?"
        description={
          deleting
            ? `"${deleting.company_name}" will be permanently removed. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </>
  );
}
