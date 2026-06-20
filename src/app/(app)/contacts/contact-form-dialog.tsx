"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/common/form-error";
import { api, getErrorMessage, type ContactResponse } from "@/lib/api";
import {
  contactFormSchema,
  contactRoles,
  contactRoleLabels,
  type ContactFormValues,
} from "@/lib/validation/contact";

const EMPTY: ContactFormValues = {
  company_name: "",
  role: "customer",
  primary_person: "",
  email: "",
  street_address: "",
  address_city: "",
  address_state: "",
  address_pincode: "",
  address_country: "",
  contact_info: "",
};

function toFormData(values: ContactFormValues, logo?: File | null): FormData {
  const fd = new FormData();
  Object.entries(values).forEach(([k, v]) => fd.append(k, String(v)));
  if (logo) fd.append("logo", logo);
  return fd;
}

export function ContactFormDialog({
  open,
  onOpenChange,
  contact,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: ContactResponse | null;
}) {
  const isEdit = !!contact;
  const queryClient = useQueryClient();

  // Roles from the backend (/contacts/roles), falling back to the known set.
  const { data: roles } = useQuery({
    queryKey: ["contact-roles"],
    queryFn: () => api.contacts.roles(),
    staleTime: 60 * 60 * 1000,
  });
  const roleOptions = roles?.length ? roles : contactRoles;
  const labelFor = (r: string) =>
    contactRoleLabels[r as keyof typeof contactRoleLabels] ?? r;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: EMPTY,
    mode: "onTouched",
  });

  // Load values when opening (prefill for edit, reset for create).
  useEffect(() => {
    if (!open) return;
    if (contact) {
      form.reset({
        company_name: contact.company_name,
        role: contact.role,
        primary_person: contact.primary_person,
        email: contact.email,
        street_address: contact.street_address,
        address_city: contact.address.city,
        address_state: contact.address.state,
        address_pincode: String(contact.address.pincode ?? ""),
        address_country: contact.address.country,
        contact_info: String(contact.contact_info ?? ""),
      });
    } else {
      form.reset(EMPTY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contact]);

  const mutation = useMutation({
    mutationFn: (values: ContactFormValues) => {
      const fd = toFormData(values);
      return isEdit
        ? api.contacts.update(contact!.id, fd)
        : api.contacts.create(fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success(isEdit ? "Contact updated" : "Contact created");
      onOpenChange(false);
    },
    onError: (err) => form.setError("root", { message: getErrorMessage(err) }),
  });

  const onSubmit = (values: ContactFormValues) => {
    form.clearErrors("root");
    mutation.mutate(values);
  };

  const submitting = mutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit contact" : "New contact"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this party's details."
              : "Add a reusable party for your shipments."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormError message={form.formState.errors.root?.message} />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Company name</FormLabel>
                    <FormControl>
                      <Input disabled={submitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={submitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((r) => (
                          <SelectItem key={r} value={r}>
                            {labelFor(r)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="primary_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary person</FormLabel>
                    <FormControl>
                      <Input disabled={submitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Email (@gmail.com)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="name@gmail.com" disabled={submitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_info"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Phone (digits only)</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" placeholder="919876543210" disabled={submitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="street_address"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Street address</FormLabel>
                    <FormControl>
                      <Input disabled={submitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address_city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input disabled={submitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input disabled={submitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address_pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" disabled={submitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address_country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input disabled={submitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Create contact"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
