import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as React from "react";

export default function SettingsPage() {
  // TODO: Workspace and Organization settings are mock data because the backend lacks configuration schemas.
  // Missing backend resources:
  // - Workspace / Organization settings database table and model
  // - API routes for loading/updating branding (brand colors, document defaults, footer)
  return (
    <>
      <Topbar title="Settings" subtitle="Workspace, organisation and document defaults" />
      <main className="flex-1 p-6 lg:p-8 grid lg:grid-cols-3 gap-6 overflow-auto">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Organisation">
            <Row label="Workspace name"><Input defaultValue="Mehta Exports" /></Row>
            <Row label="Legal entity"><Input defaultValue="Mehta Exports Pvt Ltd" /></Row>
            <Row label="Country"><Input defaultValue="India" /></Row>
            <Row label="GSTIN"><Input defaultValue="GSTIN24ABCDE1234F1Z5" /></Row>
            <Row label="IEC code"><Input defaultValue="0312345678" /></Row>
          </Card>

          <Card title="Document defaults">
            <Row label="Default currency"><Input defaultValue="USD" /></Row>
            <Row label="Default incoterm"><Input defaultValue="FOB" /></Row>
            <Row label="Invoice prefix"><Input defaultValue="MD-" /></Row>
            <Row label="Footer text"><Input defaultValue="Thank you for your business." /></Row>
          </Card>

          <Card title="Branding">
            <div className="border border-dashed border-border rounded-lg p-6 text-center text-sm text-muted-foreground mb-4">
              Drop your logo here, or click to upload
            </div>
            <Row label="Brand color"><Input defaultValue="#0F5132" /></Row>
            <Row label="Accent color"><Input defaultValue="#10B981" /></Row>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm">Cancel</Button>
            <Button size="sm">Save changes</Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card title="Plan">
            <div className="text-2xl font-semibold">Pro</div>
            <div className="text-xs text-muted-foreground">12 of 25 seats used</div>
            <Button variant="outline" size="sm" className="mt-4 w-full">Manage subscription</Button>
          </Card>
          <Card title="Danger zone">
            <p className="text-xs text-muted-foreground">
              Delete this workspace and all of its shipments, documents and contacts. This cannot be undone.
            </p>
            <Button variant="outline" size="sm" className="mt-3 w-full text-destructive border-destructive/30 hover:bg-destructive/5">
              Delete workspace
            </Button>
          </Card>
        </div>
      </main>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid md:grid-cols-3 gap-3 items-center text-sm">
      <Label className="text-muted-foreground font-normal">{label}</Label>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}
