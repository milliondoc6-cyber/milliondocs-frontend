import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from "react";

const team = [
  { name: "Priya Krishnan", email: "priya@mehtaexports.com", role: "Owner", status: "active", initials: "PK" },
  { name: "Ahmed Rizvi", email: "ahmed@mehtaexports.com", role: "Admin", status: "active", initials: "AR" },
  { name: "Sara Iyer", email: "sara@mehtaexports.com", role: "Editor", status: "active", initials: "SI" },
  { name: "Vikram Joshi", email: "vikram@mehtaexports.com", role: "Editor", status: "active", initials: "VJ" },
  { name: "Naomi Park", email: "naomi@mehtaexports.com", role: "Viewer", status: "invited", initials: "NP" },
];

const roles = [
  { name: "Owner", desc: "Full access including billing and workspace deletion" },
  { name: "Admin", desc: "Manage team, templates, and all shipments" },
  { name: "Editor", desc: "Create and edit shipments, generate documents" },
  { name: "Viewer", desc: "Read-only access to shipments and documents" },
];

export default function TeamPage() {
  // TODO: Team list and roles mapping is mock data because the backend lacks workspace member tables.
  // Missing backend resources:
  // - Workspace membership/invitation database model
  // - API routes for listing workspace members, editing roles, and sending invites
  return (
    <>
      <Topbar title="Team" subtitle="Manage members, roles and permissions" />
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-auto">
        <div className="flex justify-end">
          <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Invite member</Button>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-left font-medium px-5 py-3">Member</th>
                <th className="text-left font-medium px-5 py-3">Role</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {team.map((m) => (
                <tr key={m.email} className="hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-emerald text-primary-foreground text-xs font-medium flex items-center justify-center">{m.initials}</div>
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3"><span className="text-xs px-2 py-1 rounded-md border border-border font-medium">{m.role}</span></td>
                  <td className="px-5 py-3"><span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium uppercase", m.status === "active" ? "bg-emerald/15 text-emerald" : "bg-muted text-muted-foreground")}>{m.status}</span></td>
                  <td className="px-5 py-3 text-right"><Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Member actions"><MoreHorizontal className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Roles & permissions</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {roles.map((r) => (
              <div key={r.name} className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                <div className="font-medium text-sm">{r.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
