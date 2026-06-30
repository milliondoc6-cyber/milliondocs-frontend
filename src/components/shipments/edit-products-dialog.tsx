"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  api,
  getErrorMessage,
  type ProductDetailResponse,
  type ProductResponse,
} from "@/lib/api";

interface Row {
  detailId?: string; // present = existing record
  product_id: string;
  quantity: string;
  originalQuantity?: string;
}

interface Props {
  masterFileId: string;
  existing: ProductDetailResponse[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: (productDetailIds: string[]) => void;
}

export function EditProductsDialog({ masterFileId, existing, open, onOpenChange, onChanged }: Props) {
  const qc = useQueryClient();
  const [rows, setRows] = React.useState<Row[]>([]);
  const [removed, setRemoved] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setRows(
        existing.map((e) => ({
          detailId: e.id,
          product_id: e.product_id,
          quantity: String(e.quantity),
          originalQuantity: String(e.quantity),
        }))
      );
      setRemoved([]);
    }
  }, [open, existing]);

  const products = useQuery({ queryKey: ["products", 1, ""], queryFn: () => api.products.list(1) });
  const catalog = products.data?.items ?? [];

  const removeRow = (idx: number) => {
    setRows((rs) => {
      const row = rs[idx];
      if (row.detailId) setRemoved((r) => [...r, row.detailId!]);
      return rs.filter((_, i) => i !== idx);
    });
  };

  const save = async () => {
    setBusy(true);
    try {
      // 1. Delete removed records
      await Promise.all(removed.map((id) => api.productDetails.delete(id)));

      // 2. Patch existing rows whose quantity changed
      const changed = rows.filter(
        (r) => r.detailId && r.quantity !== r.originalQuantity && Number(r.quantity) > 0
      );
      await Promise.all(
        changed.map((r) => api.productDetails.update(r.detailId!, { quantity: Number(r.quantity) }))
      );

      // 3. Create newly-added rows
      const added = rows.filter((r) => !r.detailId && r.product_id && Number(r.quantity) > 0);
      let newIds: string[] = [];
      if (added.length) {
        const res = await api.productDetails.create({
          master_file_id: masterFileId,
          items: added.map((r) => ({ product_id: r.product_id, quantity: Number(r.quantity) })),
        });
        newIds = res.items.map((i) => i.id);
      }

      const keptIds = rows.filter((r) => r.detailId).map((r) => r.detailId!);
      const finalIds = [...keptIds, ...newIds];

      toast.success("Products updated");
      qc.invalidateQueries({ queryKey: ["product-details"] });
      onChanged(finalIds);
      onOpenChange(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit products</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {rows.length === 0 && <p className="text-sm text-muted-foreground">No products.</p>}
          {rows.map((row, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <div className="flex-1">
                <Select
                  value={row.product_id || undefined}
                  onValueChange={(v) => setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, product_id: v } : r)))}
                  disabled={!!row.detailId || catalog.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={catalog.length === 0 ? "No products" : "Select product"} />
                  </SelectTrigger>
                  <SelectContent>
                    {catalog.map((p: ProductResponse) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.code}{p.description ? ` — ${p.description}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                className="w-28"
                inputMode="decimal"
                placeholder="Qty"
                value={row.quantity}
                onChange={(e) => setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, quantity: e.target.value } : r)))}
              />
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeRow(idx)} aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setRows((rs) => [...rs, { product_id: "", quantity: "" }])}
          >
            <Plus className="h-3.5 w-3.5" /> Add product
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={save} disabled={busy} className="gap-1.5">
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
