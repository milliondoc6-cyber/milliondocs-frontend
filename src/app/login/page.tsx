"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthShell } from "@/components/layout/auth-shell";
import { FormError } from "@/components/common/form-error";
import { api, setToken, getErrorMessage, getErrorStatus } from "@/lib/api";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";

export default function LoginPage() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched", // validate a field once the user has left it
  });

  const onSubmit = async (values: LoginValues) => {
    form.clearErrors("root");
    try {
      const res = await api.auth.login(values);
      setToken(res.access_token);
      toast.success("Welcome back!");
      window.location.href = "/dashboard";
    } catch (err) {
      const status = getErrorStatus(err);
      let message = getErrorMessage(err);

      if (status === 401) {
        // Wrong credentials — highlight both fields inline.
        message = "Incorrect email or password.";
        form.setError("email", { message: " " });
        form.setError("password", { message: "Incorrect email or password" });
      } else if (status === 403) {
        // Account exists but the email isn't verified yet.
        message = "Your email isn't verified yet. Please verify it to sign in.";
      }

      form.setError("root", { message });
    }
  };

  const { isSubmitting, errors } = form.formState;

  return (
    <AuthShell
      title="Sign in to MillionDocs"
      subtitle="Welcome back. Pick up where your shipments left off."
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormError message={errors.root?.message} />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-emerald hover:underline"
                    tabIndex={-1}
                  >
                    Forgot?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
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
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>

      <p className="text-sm text-muted-foreground text-center mt-6">
        New to MillionDocs?{" "}
        <Link href="/register" className="text-emerald font-medium hover:underline">
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}
