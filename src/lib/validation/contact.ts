import { z } from "zod";

export const contactRoles = ["customer", "supplier", "forwarding", "other"] as const;
export type ContactRole = (typeof contactRoles)[number];

export const contactRoleLabels: Record<ContactRole, string> = {
  customer: "Customer / Buyer",
  supplier: "Supplier",
  forwarding: "Forwarder",
  other: "Other",
};

export const contactFormSchema = z.object({
  company_name: z.string().trim().min(1, "Company name is required"),
  role: z.enum(contactRoles),
  primary_person: z.string().trim().min(1, "Contact person is required"),
  // Backend rule: contact email must be a @gmail.com address.
  email: z
    .string()
    .trim()
    .refine((v) => /^[^@\s]+@gmail\.com$/i.test(v), "Must be a valid @gmail.com address"),
  street_address: z.string().trim().min(1, "Street address is required"),
  address_city: z.string().trim().min(1, "City is required"),
  address_state: z.string().trim().min(1, "State is required"),
  address_pincode: z.string().trim().regex(/^\d{4,10}$/, "Enter a valid pincode"),
  address_country: z.string().trim().min(1, "Country is required"),
  contact_info: z
    .string()
    .trim()
    .regex(/^\d{6,15}$/, "Enter a valid phone number (digits only)"),
});
export type ContactFormValues = z.infer<typeof contactFormSchema>;
