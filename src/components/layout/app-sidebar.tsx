"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ship } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { LogoutButton } from "@/components/layout/logout-button";

export function AppSidebar() {
  const pathname = usePathname() || "";
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg bg-emerald flex items-center justify-center">
          <Ship className="h-4 w-4 text-emerald-foreground" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">{siteConfig.name}</div>
          <div className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">
            {siteConfig.tagline}
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {mainNav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <div className="rounded-lg bg-sidebar-accent/50 p-3">
          <div className="text-xs text-sidebar-foreground/70">Workspace</div>
          <div className="text-sm font-medium">Mehta Exports</div>
          <div className="text-[11px] text-sidebar-foreground/60 mt-1">Pro plan · 12 seats</div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
