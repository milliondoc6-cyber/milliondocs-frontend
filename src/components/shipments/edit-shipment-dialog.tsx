"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, getErrorMessage, type ShipmentResponse } from "@/lib/api";

interface Props {
  shipment: ShipmentResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Fields = {
  shipment_reference: string;
  invoice_number: string;
  buyers_reference: string;
  incoterm_id: string;
  incoterm_place: string;
  dispatch_method_id: string;
  shipment_type_id: string;
  port_of_loading_id: string;
  port_of_discharge_id: string;
  final_destination: string;
  origin_country_id: string;
  destination_country_id: string;
  place_of_receipt: string;
  pre_carriage_by_id: string;
};

function initial(s: ShipmentResponse): Fields {
  return {
    shipment_reference: s.shipment_reference,
    invoice_number: s.invoice_number,
    buyers_reference: s.buyers_reference ?? "",
    incoterm_id: s.incoterm_id,
    incoterm_place: s.incoterm_place,
    dispatch_method_id: s.dispatch_method_id,
    shipment_type_id: s.shipment_type_id,
    port_of_loading_id: s.port_of_loading_id,
    port_of_discharge_id: s.port_of_discharge_id,
    final_destination: s.final_destination ?? "",
    origin_country_id: s.origin_country_id,
    destination_country_id: s.destination_country_id,
    place_of_receipt: s.place_of_receipt ?? "",
    pre_carriage_by_id: s.pre_carriage_by_id ?? "",
  };
}

export function EditShipmentDialog({ shipment, open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const [f, setF] = React.useState<Fields>(() => initial(shipment));

  React.useEffect(() => {
    if (open) setF(initial(shipment));
  }, [open, shipment]);

  const incoterms = useQuery({ queryKey: ["reference-data", "incoterms"], queryFn: () => api.referenceData.items.list("incoterms") });
  const dispatchMethods = useQuery({ queryKey: ["reference-data", "dispatch_method"], queryFn: () => api.referenceData.items.list("dispatch_method") });
  const shipmentTypes = useQuery({ queryKey: ["reference-data", "shipment_type"], queryFn: () => api.referenceData.items.list("shipment_type") });
  const countries = useQuery({ queryKey: ["countries", "all"], queryFn: () => api.referenceData.countries.list({ limit: 200 }) });
  const ports = useQuery({ queryKey: ["ports", "all"], queryFn: () => api.referenceData.ports.list({ limit: 500 }) });

  const set = (k: keyof Fields) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const mutation = useMutation({
    mutationFn: () =>
      api.shipments.update(shipment.id, {
        shipment_reference: f.shipment_reference.trim(),
        invoice_number: f.invoice_number.trim(),
        buyers_reference: f.buyers_reference.trim() || null,
        incoterm_id: f.incoterm_id,
        incoterm_place: f.incoterm_place.trim(),
        dispatch_method_id: f.dispatch_method_id,
        shipment_type_id: f.shipment_type_id,
        port_of_loading_id: f.port_of_loading_id,
        port_of_discharge_id: f.port_of_discharge_id,
        final_destination: f.final_destination.trim() || null,
        origin_country_id: f.origin_country_id,
        destination_country_id: f.destination_country_id,
        place_of_receipt: f.place_of_receipt.trim() || null,
        pre_carriage_by_id: f.pre_carriage_by_id || null,
      }),
    onSuccess: () => {
      toast.success("Shipment updated");
      qc.invalidateQueries({ queryKey: ["shipment", shipment.id] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const itemOpts = (rows?: { id: string; item: string }[]) => (rows ?? []).map((i) => ({ value: i.id, label: i.item }));
  const namedOpts = (rows?: { id: string; name: string }[]) => (rows ?? []).map((i) => ({ value: i.id, label: i.name }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit shipment</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Text label="Shipment Reference" value={f.shipment_reference} onChange={set("shipment_reference")} />
          <Text label="Invoice Number" value={f.invoice_number} onChange={set("invoice_number")} />
          <Text label="Buyers Reference" value={f.buyers_reference} onChange={set("buyers_reference")} />
          <Pick label="Incoterm" value={f.incoterm_id} onChange={set("incoterm_id")} options={itemOpts(incoterms.data)} />
          <Text label="Incoterm Place" value={f.incoterm_place} onChange={set("incoterm_place")} />
          <Pick label="Method of Dispatch" value={f.dispatch_method_id} onChange={set("dispatch_method_id")} options={itemOpts(dispatchMethods.data)} />
          <Pick label="Type of Shipment" value={f.shipment_type_id} onChange={set("shipment_type_id")} options={itemOpts(shipmentTypes.data)} />
          <Pick label="Port of Loading" value={f.port_of_loading_id} onChange={set("port_of_loading_id")} options={namedOpts(ports.data)} />
          <Pick label="Port of Discharge" value={f.port_of_discharge_id} onChange={set("port_of_discharge_id")} options={namedOpts(ports.data)} />
          <Text label="Final Destination" value={f.final_destination} onChange={set("final_destination")} />
          <Pick label="Country of Origin" value={f.origin_country_id} onChange={set("origin_country_id")} options={namedOpts(countries.data)} />
          <Pick label="Country of Destination" value={f.destination_country_id} onChange={set("destination_country_id")} options={namedOpts(countries.data)} />
          <Text label="Place of Receipt" value={f.place_of_receipt} onChange={set("place_of_receipt")} />
          <Pick label="Pre-Carriage By" value={f.pre_carriage_by_id} onChange={set("pre_carriage_by_id")} options={itemOpts(dispatchMethods.data)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="gap-1.5">
            {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Pick({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <Select value={value || undefined} onValueChange={onChange} disabled={options.length === 0}>
        <SelectTrigger>
          <SelectValue placeholder={options.length === 0 ? "No options" : "Select..."} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
