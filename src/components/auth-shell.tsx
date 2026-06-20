import Link from "next/link";
import { Ship } from "lucide-react";
import * as React from "react";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="hidden md:flex bg-sidebar text-sidebar-foreground p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald flex items-center justify-center">
            <Ship className="h-4 w-4 text-emerald-foreground" />
          </div>
          <span className="font-semibold">MillionDocs</span>
        </Link>
        <div>
          <p className="text-2xl font-medium leading-snug max-w-md">
            "We cut document prep time from 3 hours to 8 minutes per shipment."
          </p>
          <p className="text-sm text-sidebar-foreground/60 mt-4">— Priya K., Export Manager · Mehta Exports</p>
        </div>
        <div className="grid grid-cols-3 gap-6 text-xs text-sidebar-foreground/60">
          <div>
            <div className="text-sidebar-foreground text-base font-semibold">142k</div>
            shipments
          </div>
          <div>
            <div className="text-sidebar-foreground text-base font-semibold">1.2M</div>
            documents
          </div>
          <div>
            <div className="text-sidebar-foreground text-base font-semibold">86</div>
            countries
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1.5 mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
