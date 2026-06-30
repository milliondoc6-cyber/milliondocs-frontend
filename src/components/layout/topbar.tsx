import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewShipmentButton } from "@/components/shipments/new-shipment-button";
import * as React from "react";

export function Topbar({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="h-16 border-b border-border bg-card/60 backdrop-blur flex items-center px-6 gap-4 sticky top-0 z-10">
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold tracking-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
      <div className="hidden lg:flex items-center gap-2 w-72">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search shipments, contacts..." className="pl-9 h-9 bg-background" />
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Notifications">
        <Bell className="h-4 w-4" />
      </Button>
      {action ?? <NewShipmentButton className="gap-1.5" />}
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-emerald text-primary-foreground text-xs font-medium flex items-center justify-center">
        PK
      </div>
    </header>
  );
}
