"use client";

import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { clearToken } from "@/lib/api";

/**
 * Signs the user out: clears the stored token and does a full navigation to
 * /login. The hard redirect (vs router.push) guarantees all in-memory state and
 * React Query caches are wiped, so no authed data lingers after sign-out.
 */
export function LogoutButton() {
  const onLogout = () => {
    clearToken();
    toast.success("Signed out");
    window.location.href = "/login";
  };

  return (
    <button
      type="button"
      onClick={onLogout}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}
