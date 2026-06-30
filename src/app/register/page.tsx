"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AuthShell } from "@/components/layout/auth-shell";
import { FormError } from "@/components/common/form-error";
import { api, getErrorMessage, getErrorStatus } from "@/lib/api";
import {
  registerFormSchema,
  otpFormSchema,
  type RegisterFormValues,
  type OtpFormValues,
} from "@/lib/validation/auth";

/** Build a backend-safe username (3–50 chars) from the entered name. */
function buildUsername(firstName: string, lastName: string): string {
  const base = `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, "");
  const suffix = String(Date.now()).slice(-5);
  return `${base || "user"}${suffix}`.slice(0, 50);
}

export default function RegisterPage() {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [email, setEmail] = useState("");

  const detailsForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      company: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { otp: "" },
    mode: "onTouched",
  });

  const onRegister = async (values: RegisterFormValues) => {
    detailsForm.clearErrors("root");
    try {
      const res = await api.auth.register({
        email: values.email,
        password: values.password,
        username: buildUsername(values.firstName, values.lastName),
        phone_number: values.phone.replace(/[\s-]/g, ""),
      });
      setEmail(values.email);
      setStep("otp");
      toast.success(res.message || "We sent a verification code to your email.");
    } catch (err) {
      const status = getErrorStatus(err);
      let message = getErrorMessage(err);
      if (status === 409) {
        message = "An account with this email already exists. Try signing in instead.";
        detailsForm.setError("email", { message: "Email already registered" });
      }
      detailsForm.setError("root", { message });
    }
  };

  const onVerify = async (values: OtpFormValues) => {
    otpForm.clearErrors("root");
    try {
      const res = await api.auth.verifyOtp({ email, otp: values.otp });
      toast.success(res.message || "Email verified! You're all set.");
      window.location.href = "/onboarding";
    } catch (err) {
      const message = getErrorMessage(err);
      otpForm.setError("otp", { message: "Invalid or expired code" });
      otpForm.setError("root", { message });
    }
  };

  const onResend = async () => {
    // Re-trigger the code by resubmitting the verified details.
    const values = detailsForm.getValues();
    try {
      await api.auth.register({
        email: values.email,
        password: values.password,
        username: buildUsername(values.firstName, values.lastName),
        phone_number: values.phone.replace(/[\s-]/g, ""),
      });
      toast.success("A new code is on its way.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // ── OTP step ──────────────────────────────────────────────────────────────
  if (step === "otp") {
    const { isSubmitting, errors } = otpForm.formState;
    return (
      <AuthShell
        title="Verify your email"
        subtitle={`Enter the 6-digit code we sent to ${email}.`}
      >
        <Form {...otpForm}>
          <form className="space-y-5" onSubmit={otpForm.handleSubmit(onVerify)} noValidate>
            <FormError message={errors.root?.message} />

            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification code</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} className="h-11 w-11 text-base" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify code"
              )}
            </Button>
          </form>
        </Form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Didn&apos;t get a code?{" "}
          <button
            type="button"
            onClick={onResend}
            className="text-emerald font-medium hover:underline"
          >
            Resend
          </button>
        </p>
      </AuthShell>
    );
  }

  // ── Details step ──────────────────────────────────────────────────────────
  const { isSubmitting, errors } = detailsForm.formState;
  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Start with your team in under 2 minutes. No card required."
    >
      <Form {...detailsForm}>
        <form className="space-y-4" onSubmit={detailsForm.handleSubmit(onRegister)} noValidate>
          <FormError message={errors.root?.message} />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={detailsForm.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input autoComplete="given-name" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={detailsForm.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input autoComplete="family-name" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={detailsForm.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Mehta Exports"
                    autoComplete="organization"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={detailsForm.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (with country code)</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={detailsForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={detailsForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={detailsForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating workspace...
              </>
            ) : (
              "Create workspace"
            )}
          </Button>
        </form>
      </Form>

      <p className="text-sm text-muted-foreground text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
