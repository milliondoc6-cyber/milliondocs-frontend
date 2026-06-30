"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { api, getErrorMessage } from "@/lib/api";

/**
 * "Select document set" step. Lists real document sets from `GET /document-set`,
 * lets the user check the ones they want, and create new ones via
 * `POST /document-set` ("Request new template").
 *
 * Returns the chosen set NAMES via `onConfirm` — the caller persists them
 * (per-shipment selection has no backend endpoint yet).
 */
export function SelectDocumentSetDialog({
  open,
  onOpenChange,
  initialSelected = [],
  confirmLabel,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSelected?: string[];
  confirmLabel?: string;
  onConfirm: (names: string[]) => void;
}) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [newName, setNewName] = useState("");

  const { data: sets, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["document-sets"],
    queryFn: () => api.documentSets.list({ active_only: true, limit: 500 }),
    enabled: open,
  });

  // Seed the checked state whenever the dialog (re)opens.
  useEffect(() => {
    if (open) setSelected(new Set(initialSelected));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const createMutation = useMutation({
    mutationFn: (name: string) => api.documentSets.create([name]),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["document-sets"] });
      // Auto-check the newly created set.
      const names = created.map((c) => c.name);
      setSelected((prev) => {
        const next = new Set(prev);
        names.forEach((n) => next.add(n));
        return next;
      });
      setNewName("");
      toast.success(names.length > 1 ? "Templates added" : "Template added");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const toggle = (name: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const onRequestNew = () => {
    const name = newName.trim();
    if (!name) return;
    createMutation.mutate(name);
  };

  const sortedSets = useMemo(
    () => [...(sets ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [sets]
  );

  const count = selected.size;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select document set</DialogTitle>
          <DialogDescription>
            Choose the documents to generate for this shipment.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-1 px-1 min-h-[12rem]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              <p>{getErrorMessage(error)}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : sortedSets.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              No document templates yet. Create one below.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {sortedSets.map((s) => (
                <li key={s.id}>
                  <label className="flex items-center gap-3 py-2.5 cursor-pointer">
                    <Checkbox
                      checked={selected.has(s.name)}
                      onCheckedChange={() => toggle(s.name)}
                    />
                    <span className="text-sm">{s.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border pt-3 flex items-center gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Request new template…"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onRequestNew();
              }
            }}
            disabled={createMutation.isPending}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRequestNew}
            disabled={!newName.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(Array.from(selected))}>
            {confirmLabel ?? `Add ${count} doc${count === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
