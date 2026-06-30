"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { api, getErrorMessage, type ShippingDetailsResponse } from "@/lib/api";

interface Props {
  shipping: ShippingDetailsResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

type State = Omit<ShippingDetailsResponse, "id" | "created_at" | "updated_at">;

function initial(s: ShippingDetailsResponse): State {
  return {
    etd: s.etd,
    eta: s.eta,
    vessel_aircraft_vehicle: s.vessel_aircraft_vehicle,
    voyage_flight_number: s.voyage_flight_number,
    bill_of_lading_number: s.bill_of_lading_number,
    export_declaration_number: s.export_declaration_number,
    document_instructions: s.document_instructions,
    freight_charges: s.freight_charges,
    marine_cover_policy_number: s.marine_cover_policy_number,
    hazardous_goods: s.hazardous_goods,
    letter_of_credit: s.letter_of_credit,
    letter_of_credit_number: s.letter_of_credit_number ?? "",
    special_instructions: s.special_instructions ?? "",
  };
}

export function EditShippingDialog({ shipping, open, onOpenChange, onDeleted }: Props) {
  const qc = useQueryClient();
  const [s, setS] = React.useState<State>(() => initial(shipping));

  React.useEffect(() => {
    if (open) setS(initial(shipping));
  }, [open, shipping]);

  const set = <K extends keyof State>(k: K, v: State[K]) => setS((p) => ({ ...p, [k]: v }));

  const save = useMutation({
    mutationFn: () =>
      api.shippingDetails.update(shipping.id, {
        etd: s.etd,
        eta: s.eta,
        vessel_aircraft_vehicle: s.vessel_aircraft_vehicle,
        voyage_flight_number: s.voyage_flight_number,
        bill_of_lading_number: s.bill_of_lading_number,
        export_declaration_number: s.export_declaration_number,
        document_instructions: s.document_instructions,
        freight_charges: s.freight_charges,
        marine_cover_policy_number: s.marine_cover_policy_number,
        hazardous_goods: s.hazardous_goods,
        letter_of_credit: s.letter_of_credit,
        letter_of_credit_number: s.letter_of_credit_number || null,
        special_instructions: s.special_instructions || null,
      }),
    onSuccess: () => {
      toast.success("Shipping details updated");
      qc.invalidateQueries({ queryKey: ["shipping-details"] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: () => api.shippingDetails.delete(shipping.id),
    onSuccess: () => {
      toast.success("Shipping details deleted");
      onOpenChange(false);
      onDeleted();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const busy = save.isPending || remove.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit shipping details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="ETD" type="date" value={s.etd} onChange={(v) => set("etd", v)} />
          <Field label="ETA" type="date" value={s.eta} onChange={(v) => set("eta", v)} />
          <Field label="Vessel / Aircraft / Vehicle" value={s.vessel_aircraft_vehicle} onChange={(v) => set("vessel_aircraft_vehicle", v)} />
          <Field label="Voyage / Flight number" value={s.voyage_flight_number} onChange={(v) => set("voyage_flight_number", v)} />
          <Field label="Bill of Lading number" value={s.bill_of_lading_number} onChange={(v) => set("bill_of_lading_number", v)} />
          <Field label="Export Declaration number" value={s.export_declaration_number} onChange={(v) => set("export_declaration_number", v)} />
          <Field label="Document Instructions" value={s.document_instructions} onChange={(v) => set("document_instructions", v)} />
          <Field label="Freight Charges" value={s.freight_charges} onChange={(v) => set("freight_charges", v)} />
          <Field label="Marine Cover Policy number" value={s.marine_cover_policy_number} onChange={(v) => set("marine_cover_policy_number", v)} />
          <Field label="Letter of Credit number" value={s.letter_of_credit_number ?? ""} onChange={(v) => set("letter_of_credit_number", v)} />
          <Field label="Special Instructions" value={s.special_instructions ?? ""} onChange={(v) => set("special_instructions", v)} />
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={s.hazardous_goods} onCheckedChange={(c) => set("hazardous_goods", !!c)} /> Hazardous goods
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={s.letter_of_credit} onCheckedChange={(c) => set("letter_of_credit", !!c)} /> Letter of credit
            </label>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" className="text-destructive" onClick={() => remove.mutate()} disabled={busy}>
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={() => save.mutate()} disabled={busy} className="gap-1.5">
              {save.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
