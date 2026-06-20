"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, FileText, Users, Boxes, FileBox, Upload,
  UserCog, Settings, Ship,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/shipments", label: "Shipments", icon: Package },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/products", label: "Products", icon: Boxes },
  { href: "/templates", label: "Templates", icon: FileBox },
  { href: "/imports", label: "Imports", icon: Upload },
  { href: "/team", label: "Team", icon: UserCog },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = usePathname() || "";
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg bg-emerald flex items-center justify-center">
          <Ship className="h-4 w-4 text-emerald-foreground" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">MillionDocs</div>
          <div className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">Export OS</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <div className="rounded-lg bg-sidebar-accent/50 p-3">
          <div className="text-xs text-sidebar-foreground/70">Workspace</div>
          <div className="text-sm font-medium">Mehta Exports</div>
          <div className="text-[11px] text-sidebar-foreground/60 mt-1">Pro plan · 12 seats</div>
        </div>
      </div>
    </aside>
  );
}
