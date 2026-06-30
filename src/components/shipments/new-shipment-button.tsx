"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SelectDocumentSetDialog } from "@/components/shipments/select-document-set-dialog";
import { setPendingDocumentSet } from "@/lib/data/shipment-store";

/**
 * New-shipment flow: pick the document set FIRST, then jump straight to the
 * Master File builder. The chosen documents are handed to the builder (via
 * sessionStorage) so they're saved with the shipment and shown later as its
 * document folder.
 */
function useNewShipmentFlow() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const dialog = (
    <SelectDocumentSetDialog
      open={open}
      onOpenChange={setOpen}
      confirmLabel="Continue"
      onConfirm={(names) => {
        setPendingDocumentSet(names);
        setOpen(false);
        router.push("/shipments/builder");
      }}
    />
  );

  return { open: () => setOpen(true), dialog };
}

export function NewShipmentButton({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "default";
}) {
  const flow = useNewShipmentFlow();
  return (
    <>
      <Button size={size} className={className} onClick={flow.open}>
        <Plus className="h-4 w-4" /> New shipment
      </Button>
      {flow.dialog}
    </>
  );
}

/** Dashboard "Quick action" tile variant — same document-set-first flow. */
export function NewShipmentQuickAction() {
  const flow = useNewShipmentFlow();
  return (
    <>
      <button
        type="button"
        onClick={flow.open}
        className="flex flex-col items-start gap-2 p-3 rounded-lg border border-border hover:border-emerald/50 hover:bg-emerald/5 transition-colors text-left cursor-pointer w-full"
      >
        <Plus className="h-4 w-4 text-emerald" />
        <span className="text-xs font-medium">New shipment</span>
      </button>
      {flow.dialog}
    </>
  );
}
