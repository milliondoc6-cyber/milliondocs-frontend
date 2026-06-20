import { z } from "zod";

/** Optional numeric text field — allows empty or a valid number. */
const numeric = (label: string) =>
  z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || !Number.isNaN(Number(v)), `${label} must be a number`);

export const productFormSchema = z.object({
  code: z.string().trim().min(1, "SKU / code is required"),
  description: z.string().trim().optional(),
  country_of_origin: z.string().trim().min(1, "Country of origin is required"),
  unit_of_measurement: z.string().trim().optional(),
  hs_code: z.string().trim().optional(),
  sell_price: numeric("Sell price"),
  buy_price: numeric("Buy price"),
  net_weight_kg: numeric("Net weight"),
  gross_weight_kg: numeric("Gross weight"),
  cubic_measurement_m3: numeric("Volume"),
});
export type ProductFormValues = z.infer<typeof productFormSchema>;
