import { z } from "zod";

/**
 * Form validation schemas for the auth pages (login / register / OTP).
 * These are UI concerns (what the user types) — separate from the API payloads
 * in `lib/api/auth.ts`. The pages map form values -> API payloads on submit.
 */

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

/** The register form (more fields than the API needs). */
export const registerFormSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    company: z.string().trim().min(1, "Company name is required"),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9][0-9\s-]{8,18}[0-9]$/, "Enter a valid phone number with country code"),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(1, "Please re-enter your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type RegisterFormValues = z.infer<typeof registerFormSchema>;

/** The OTP step form (email is carried in component state). */
export const otpFormSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit code"),
});
export type OtpFormValues = z.infer<typeof otpFormSchema>;
