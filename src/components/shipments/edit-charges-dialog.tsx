"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { api, getErrorMessage, type AdditionalChargesResponse } from "@/lib/api";

interface Line {
  lineId?: string;
  name: string;
  amount: string;
  originalName?: string;
  originalAmount?: string;
}

interface Props {
  masterFileId: string;
  existing: AdditionalChargesResponse | null | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditChargesDialog({ masterFileId, existing, open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const [lines, setLines] = React.useState<Line[]>([]);
  const [removed, setRemoved] = React.useState<string[]>([]);
  const [taxName, setTaxName] = React.useState("");
  const [taxRate, setTaxRate] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setLines(
        (existing?.charges ?? []).map((c) => ({
          lineId: c.id,
          name: c.name,
          amount: c.amount,
          originalName: c.name,
          originalAmount: c.amount,
        }))
      );
      setRemoved([]);
      setTaxName(existing?.tax_name ?? "");
      setTaxRate(existing?.tax_rate ?? "");
    }
  }, [open, existing]);

  const removeLine = (idx: number) => {
    setLines((ls) => {
      const line = ls[idx];
      if (line.lineId) setRemoved((r) => [...r, line.lineId!]);
      return ls.filter((_, i) => i !== idx);
    });
  };

  const invalidate = () => qc.invalidateQueries({ queryKey: ["additional-charges", masterFileId] });

  const save = async () => {
    setBusy(true);
    try {
      if (!existing) {
        // No charges block yet → create one with all valid lines + tax
        const valid = lines.filter((l) => l.name.trim() && Number(l.amount) > 0);
        await api.additionalCharges.create({
          master_file_id: masterFileId,
          charges: valid.map((l) => ({ name: l.name.trim(), amount: Number(l.amount) })),
          tax_name: taxName.trim() || null,
          tax_rate: taxRate.trim() ? Number(taxRate) : null,
        });
      } else {
        const id = existing.id;
        // Tax change
        if ((existing.tax_name ?? "") !== taxName.trim() || (existing.tax_rate ?? "") !== taxRate.trim()) {
          await api.additionalCharges.update(id, {
            tax_name: taxName.trim() || null,
            tax_rate: taxRate.trim() ? Number(taxRate) : null,
          });
        }
        // Removed lines
        for (const lineId of removed) await api.additionalCharges.deleteLine(id, lineId);
        // Changed existing lines
        for (const l of lines) {
          if (l.lineId && (l.name !== l.originalName || l.amount !== l.originalAmount) && l.name.trim() && Number(l.amount) > 0) {
            await api.additionalCharges.updateLine(id, l.lineId, { name: l.name.trim(), amount: Number(l.amount) });
          }
        }
        // New lines
        for (const l of lines) {
          if (!l.lineId && l.name.trim() && Number(l.amount) > 0) {
            await api.additionalCharges.addLine(id, { name: l.name.trim(), amount: Number(l.amount) });
          }
        }
      }
      toast.success("Charges updated");
      invalidate();
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
          <DialogTitle>{existing ? "Edit charges & tax" : "Add charges & tax"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {lines.length === 0 && <p className="text-sm text-muted-foreground">No charge lines.</p>}
          {lines.map((line, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <Input
                className="flex-1"
                placeholder="Charge name (e.g. Freight)"
                value={line.name}
                onChange={(e) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, name: e.target.value } : l)))}
              />
              <Input
                className="w-36"
                inputMode="decimal"
                placeholder="Amount"
                value={line.amount}
                onChange={(e) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, amount: e.target.value } : l)))}
              />
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeLine(idx)} aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setLines((ls) => [...ls, { name: "", amount: "" }])}
          >
            <Plus className="h-3.5 w-3.5" /> Add charge
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-sm font-medium mb-1.5">Tax name</label>
            <Input value={taxName} onChange={(e) => setTaxName(e.target.value)} placeholder="VAT, GST…" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Tax rate (%)</label>
            <Input value={taxRate} inputMode="decimal" onChange={(e) => setTaxRate(e.target.value)} />
          </div>
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
