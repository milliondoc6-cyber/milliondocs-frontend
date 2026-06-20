"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+919876543210");
  const [password, setPassword] = useState("");
  
  // OTP Flow
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // The backend UserCreate expects email, password, username, phone_number
      // Generate a username safely
      const cleanFn = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanLn = lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const generatedUsername = `${cleanFn}${cleanLn}` || "user" + Math.floor(Math.random() * 1000);

      const payload = {
        email,
        password,
        username: generatedUsername + Math.floor(Math.random() * 1000),
        phone_number: phone,
      };

      const res = await api.auth.register(payload);
      toast.success(res.message || "OTP sent to your email!");
      setOtpSent(true);
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please verify the input values.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.auth.verifyOtp({ email, otp });
      toast.success(res.message || "Email verified successfully!");
      window.location.href = "/onboarding";
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell 
      title={otpSent ? "Verify your email" : "Create your workspace"} 
      subtitle={otpSent ? `We sent a verification code to ${email}` : "Start with your team in under 2 minutes. No card required."}
    >
      {otpSent ? (
        <form className="space-y-4" onSubmit={handleOtpVerify}>
          <div className="space-y-1.5">
            <Label htmlFor="otp">Verification Code (6-digit OTP)</Label>
            <Input 
              id="otp" 
              placeholder="e.g. 123456" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify Code"}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleRegisterSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fn">First name</Label>
              <Input id="fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ln">Last name</Label>
              <Input id="ln" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="co">Company</Label>
            <Input id="co" placeholder="e.g. Mehta Exports" value={company} onChange={(e) => setCompany(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone (with country code)</Label>
            <Input id="phone" placeholder="+919876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="em">Work email</Label>
            <Input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">Password</Label>
            <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating workspace..." : "Create workspace"}
          </Button>
        </form>
      )}
      <p className="text-sm text-muted-foreground text-center mt-6">
        Already have an account? <Link href="/login" className="text-emerald font-medium hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
