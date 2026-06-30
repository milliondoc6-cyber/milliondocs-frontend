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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, getErrorMessage, type PartyResponse } from "@/lib/api";

interface Props {
  party: PartyResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FIELDS: { key: keyof Omit<PartyResponse, "id" | "created_at" | "updated_at">; label: string }[] = [
  { key: "exporter_contact_id", label: "Exporter" },
  { key: "consignee_contact_id", label: "Consignee" },
  { key: "buyer_contact_id", label: "Buyer" },
  { key: "logistics_provider_contact_id", label: "Logistics provider" },
  { key: "notify_party_contact_id", label: "Notify party" },
];

export function EditPartiesDialog({ party, open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const [values, setValues] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setValues({
        exporter_contact_id: party.exporter_contact_id,
        consignee_contact_id: party.consignee_contact_id,
        buyer_contact_id: party.buyer_contact_id,
        logistics_provider_contact_id: party.logistics_provider_contact_id,
        notify_party_contact_id: party.notify_party_contact_id,
      });
    }
  }, [open, party]);

  const contacts = useQuery({ queryKey: ["contacts"], queryFn: () => api.contacts.list() });

  const mutation = useMutation({
    mutationFn: () =>
      api.parties.update(party.id, {
        exporter_contact_id: values.exporter_contact_id,
        consignee_contact_id: values.consignee_contact_id,
        buyer_contact_id: values.buyer_contact_id,
        logistics_provider_contact_id: values.logistics_provider_contact_id,
        notify_party_contact_id: values.notify_party_contact_id,
      }),
    onSuccess: () => {
      toast.success("Parties updated");
      qc.invalidateQueries({ queryKey: ["party", party.id] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const list = contacts.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit parties</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {FIELDS.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1.5">{label}</label>
              <Select
                value={values[key] || undefined}
                onValueChange={(v) => setValues((p) => ({ ...p, [key]: v }))}
                disabled={list.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={list.length === 0 ? "No contacts" : "Select contact"} />
                </SelectTrigger>
                <SelectContent>
                  {list.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
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
