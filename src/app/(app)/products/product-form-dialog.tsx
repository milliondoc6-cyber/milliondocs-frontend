"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/common/form-error";
import { api, getErrorMessage, type ProductResponse } from "@/lib/api";
import { productFormSchema, type ProductFormValues } from "@/lib/validation/product";

const EMPTY: ProductFormValues = {
  code: "",
  description: "",
  country_of_origin: "",
  unit_of_measurement: "",
  hs_code: "",
  sell_price: "",
  buy_price: "",
  net_weight_kg: "",
  gross_weight_kg: "",
  cubic_measurement_m3: "",
};

const NUMERIC_FIELDS = [
  "sell_price",
  "buy_price",
  "net_weight_kg",
  "gross_weight_kg",
  "cubic_measurement_m3",
] as const;

/** Drop empty fields; coerce numeric fields to numbers for the API. */
function toPayload(values: ProductFormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(values)) {
    const v = typeof raw === "string" ? raw.trim() : raw;
    if (v === "" || v === undefined) continue;
    payload[key] = (NUMERIC_FIELDS as readonly string[]).includes(key)
      ? Number(v)
      : v;
  }
  return payload;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductResponse | null;
}) {
  const isEdit = !!product;
  const queryClient = useQueryClient();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: EMPTY,
    mode: "onTouched",
  });

  useEffect(() => {
    if (!open) return;
    if (product) {
      form.reset({
        code: product.code ?? "",
        description: product.description ?? "",
        country_of_origin: product.country_of_origin ?? "",
        unit_of_measurement: product.unit_of_measurement ?? "",
        hs_code: product.hs_code ?? "",
        sell_price: product.sell_price != null ? String(product.sell_price) : "",
        buy_price: product.buy_price != null ? String(product.buy_price) : "",
        net_weight_kg: product.net_weight_kg != null ? String(product.net_weight_kg) : "",
        gross_weight_kg: product.gross_weight_kg != null ? String(product.gross_weight_kg) : "",
        cubic_measurement_m3:
          product.cubic_measurement_m3 != null ? String(product.cubic_measurement_m3) : "",
      });
    } else {
      form.reset(EMPTY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product]);

  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const payload = toPayload(values);
      return isEdit
        ? api.products.update(product!.id, payload)
        : api.products.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(isEdit ? "Product updated" : "Product created");
      onOpenChange(false);
    },
    onError: (err) => form.setError("root", { message: getErrorMessage(err) }),
  });

  const onSubmit = (values: ProductFormValues) => {
    form.clearErrors("root");
    mutation.mutate(values);
  };

  const submitting = mutation.isPending;

  const textField = (
    name: keyof ProductFormValues,
    label: string,
    opts?: { placeholder?: string; numeric?: boolean; colSpan2?: boolean },
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={opts?.colSpan2 ? "col-span-2" : undefined}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              inputMode={opts?.numeric ? "decimal" : undefined}
              placeholder={opts?.placeholder}
              disabled={submitting}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit product" : "New product"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this catalog item." : "Add an item to your product catalog."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormError message={form.formState.errors.root?.message} />

            <div className="grid grid-cols-2 gap-3">
              {textField("code", "SKU / Code", { placeholder: "ABC-001" })}
              {textField("hs_code", "HS Code", { placeholder: "1234.56" })}
              {textField("description", "Product name / description", { colSpan2: true })}
              {textField("country_of_origin", "Country of origin", { placeholder: "India" })}
              {textField("unit_of_measurement", "Unit", { placeholder: "pcs" })}
              {textField("sell_price", "Sell price", { numeric: true, placeholder: "0.00" })}
              {textField("buy_price", "Buy price", { numeric: true, placeholder: "0.00" })}
              {textField("net_weight_kg", "Net weight (kg)", { numeric: true })}
              {textField("gross_weight_kg", "Gross weight (kg)", { numeric: true })}
              {textField("cubic_measurement_m3", "Volume (m³)", { numeric: true, colSpan2: true })}
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
                {isEdit ? "Save changes" : "Create product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
