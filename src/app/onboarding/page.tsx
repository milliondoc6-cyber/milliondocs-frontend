"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const steps = ["Workspace", "Branding", "Invite team"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 border-b border-border flex items-center px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Ship className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold">MillionDocs</span>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <h1 className="sr-only">Set up your MillionDocs workspace</h1>
          <ol className="flex items-center gap-3 mb-10">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-3 flex-1">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium border",
                    i < step
                      ? "bg-emerald text-emerald-foreground border-emerald"
                      : i === step
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border"
                  )}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    i === step ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {s}
                </span>
                {i < steps.length - 1 && <div className="flex-1 h-px bg-border" />}
              </li>
            ))}
          </ol>

          <div className="rounded-xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
            {step === 0 && (
              <>
                <h2 className="text-xl font-semibold tracking-tight">Name your workspace</h2>
                <p className="text-sm text-muted-foreground mt-1">This is your organisation inside MillionDocs.</p>
                <div className="space-y-4 mt-6">
                  <div className="space-y-1.5">
                    <Label>Workspace name</Label>
                    <Input defaultValue="Mehta Exports" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Country of operation</Label>
                    <Input defaultValue="India" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>GSTIN / Tax ID</Label>
                    <Input placeholder="Optional" />
                  </div>
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <h2 className="text-xl font-semibold tracking-tight">Add your branding</h2>
                <p className="text-sm text-muted-foreground mt-1">Used on every generated document.</p>
                <div className="space-y-4 mt-6">
                  <div className="space-y-1.5">
                    <Label>Logo</Label>
                    <div className="border border-dashed border-border rounded-lg p-6 text-center text-sm text-muted-foreground">
                      Drop your logo here, or click to upload
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Brand color</Label>
                      <Input defaultValue="#0F5132" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Document footer</Label>
                      <Input defaultValue="www.mehtaexports.com" />
                    </div>
                  </div>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="text-xl font-semibold tracking-tight">Invite your team</h2>
                <p className="text-sm text-muted-foreground mt-1">You can always invite more from Settings.</p>
                <div className="space-y-3 mt-6">
                  <Input placeholder="teammate@yourcompany.com" />
                  <Input placeholder="teammate@yourcompany.com" />
                  <Input placeholder="teammate@yourcompany.com" />
                </div>
              </>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
              >
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={() => setStep(step + 1)}>Continue</Button>
              ) : (
                <Button onClick={() => router.push("/dashboard")}>Enter workspace</Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
