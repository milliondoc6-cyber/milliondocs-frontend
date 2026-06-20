"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("priya@mehtaexports.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // The backend login expects email and password
      const res = await api.auth.login({ email, password });
      localStorage.setItem("token", res.access_token);
      toast.success("Successfully logged in!");
      window.location.href = "/dashboard";
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Sign in to MillionDocs" subtitle="Welcome back. Pick up where your shipments left off.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input 
            id="email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="pw">Password</Label>
            <Link href="/forgot-password" className="text-xs text-emerald hover:underline">Forgot?</Link>
          </div>
          <Input 
            id="pw" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground text-center mt-6">
        New to MillionDocs? <Link href="/register" className="text-emerald font-medium hover:underline">Create account</Link>
      </p>
    </AuthShell>
  );
}
