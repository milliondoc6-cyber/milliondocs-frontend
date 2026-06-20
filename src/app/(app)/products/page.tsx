"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Upload, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { api, getErrorMessage, type ProductResponse } from "@/lib/api";
import { toast } from "sonner";
import { ProductFormDialog } from "./product-form-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductResponse | null>(null);
  const [deleting, setDeleting] = useState<ProductResponse | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", page, searchQuery],
    queryFn: () => api.products.list(page, searchQuery),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
      setDeleting(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (p: ProductResponse) => {
    setEditing(p);
    setFormOpen(true);
  };

  const productsList = data?.items || [];
  const total = data?.total || 0;
  const pageSize = data?.page_size || 10;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <Topbar title="Products" subtitle="Master catalog with HS codes, weights and pricing" />
      <main className="flex-1 p-6 lg:p-8 space-y-5 overflow-auto">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by SKU / code..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Import CSV
          </Button>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> New product
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <AlertCircle className="h-4 w-4" />
            <span>{getErrorMessage(error)}</span>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-sm text-muted-foreground">Loading products...</div>
        ) : productsList.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground border border-dashed rounded-xl border-border">
            No products found. Click &ldquo;New product&rdquo; to add one.
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="text-left font-medium px-5 py-3">SKU (Code)</th>
                  <th className="text-left font-medium px-5 py-3">Product Name</th>
                  <th className="text-left font-medium px-5 py-3">Origin</th>
                  <th className="text-left font-medium px-5 py-3">HS Code</th>
                  <th className="text-right font-medium px-5 py-3">Net wt</th>
                  <th className="text-right font-medium px-5 py-3">Gross wt</th>
                  <th className="text-right font-medium px-5 py-3">Unit price</th>
                  <th className="text-right font-medium px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {productsList.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono text-xs">{p.code}</td>
                    <td className="px-5 py-3 font-medium">{p.description || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.country_of_origin || "—"}</td>
                    <td className="px-5 py-3 font-mono text-xs">{p.hs_code || "—"}</td>
                    <td className="px-5 py-3 text-right">
                      {p.net_weight_kg ? `${p.net_weight_kg} kg` : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {p.gross_weight_kg ? `${p.gross_weight_kg} kg` : "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-medium">
                      {p.sell_price ? Number(p.sell_price).toFixed(2) : "0.00"}/
                      {p.unit_of_measurement || "pcs"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEdit(p)}
                          aria-label="Edit product"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => setDeleting(p)}
                          aria-label="Delete product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-5 py-3 border-t border-border text-xs text-muted-foreground">
              <span>
                Showing Page {page} of {totalPages || 1} (Total {total} products)
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete product?"
        description={
          deleting
            ? `"${deleting.code}" will be permanently removed. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </>
  );
}
