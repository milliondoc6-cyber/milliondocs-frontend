"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";

export default function ForgotPage() {
  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a secure link to reset it.">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); }}>
        <div className="space-y-1.5">
          <Label htmlFor="em">Work email</Label>
          <Input id="em" type="email" />
        </div>
        <Button type="submit" className="w-full">Send reset link</Button>
      </form>
      <p className="text-sm text-muted-foreground text-center mt-6">
        Back to <Link href="/login" className="text-emerald font-medium hover:underline">sign in</Link>
      </p>
    </AuthShell>
  );
}
