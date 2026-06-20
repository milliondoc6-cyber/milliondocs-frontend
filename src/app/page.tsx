import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Ship, Workflow, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "MillionDocs — Export Documentation Automation Platform",
  description: "MillionDocs centralises buyers, products and shipments so export teams can generate every customs document — invoice, packing list, BL — from one workspace.",
  alternates: {
    canonical: "https://milliondocs.lovable.app/",
  },
  openGraph: {
    title: "MillionDocs — Export Documentation Automation Platform",
    description: "Run export operations like an enterprise team. Auto-generate every export document from a single source of truth.",
    url: "https://milliondocs.lovable.app/",
    type: "website",
  },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "MillionDocs",
            url: "https://milliondocs.lovable.app/",
            description: "Enterprise export documentation automation platform.",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "MillionDocs",
            url: "https://milliondocs.lovable.app/",
          }),
        }}
      />

      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Ship className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">MillionDocs</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Start free</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-6">
          <Sparkles className="h-3 w-3 text-emerald" /> Export documentation, automated end-to-end
        </div>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight max-w-3xl mx-auto leading-[1.05]">
          Run your export operations like an enterprise team.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-6">
          MillionDocs centralises buyers, products and shipments — then generates every export document from a single source of truth.
        </p>
        <div className="flex justify-center gap-3 mt-8">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Start your workspace <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">View live demo</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-20 text-left">
          {[
            { icon: Workflow, title: "Shipment workspaces", body: "One folder per shipment — parties, products, containers, documents and files in sync." },
            { icon: Sparkles, title: "Autofill engine", body: "Pick a buyer, pick a product. Every invoice, packing list and BL fills itself." },
            { icon: ShieldCheck, title: "Audit-ready", body: "Versioned documents, signed PDFs and a full activity log for every change." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border p-6 bg-card shadow-[var(--shadow-card)]">
              <f.icon className="h-5 w-5 text-emerald mb-3" />
              <div className="font-medium">{f.title}</div>
              <p className="text-sm text-muted-foreground mt-1.5">{f.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
