import type { Metadata } from "next";
import Link from "next/link";
import { Ship, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Prepare a Commercial Invoice for Customs | MillionDocs",
  description: "A practical guide for export managers: mandatory fields, valuation rules, and the most common mistakes that cause customs delays on a commercial invoice.",
  alternates: {
    canonical: "https://milliondocs.lovable.app/resources/commercial-invoice",
  },
  openGraph: {
    title: "How to Prepare a Commercial Invoice for Customs",
    description: "Mandatory fields, valuation rules, and common mistakes that delay shipments at customs.",
    url: "https://milliondocs.lovable.app/resources/commercial-invoice",
    type: "article",
  },
};

export default function CommercialInvoiceGuide() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "How to Prepare a Commercial Invoice for Customs",
            description: "Mandatory fields, valuation rules, and common mistakes that delay shipments at customs.",
            author: { "@type": "Organization", name: "MillionDocs" },
            publisher: { "@type": "Organization", name: "MillionDocs" },
          }),
        }}
      />

      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Ship className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">MillionDocs</span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs uppercase tracking-wider text-emerald font-medium">Resources · Customs compliance</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
          How to prepare a commercial invoice for customs
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          The commercial invoice is the single most scrutinised document in any export shipment. Customs authorities use it to
          assess duty, verify origin, and decide whether your goods clear in hours or sit in bond for days. Here's exactly what
          belongs on it — and the mistakes that get shipments held.
        </p>

        <article className="prose-content mt-12 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold tracking-tight">What a commercial invoice actually is</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              A commercial invoice is the seller's binding statement to the buyer and to customs about what is being shipped,
              who owns it, what it is worth, and on what trade terms. Unlike a proforma invoice (which is a quotation), the
              commercial invoice is the legal record used for customs valuation, duty assessment, payment, and dispute
              resolution.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight">Mandatory fields, in the order customs reads them</h2>
            <ul className="mt-4 space-y-3">
              {[
                ["Exporter (Seller) details", "Legal name, full address, country, tax/EORI/GSTIN. Must match the entity on the export licence."],
                ["Consignee (Buyer) details", "Legal name and address of the party taking title. If 'Notify Party' differs, list it separately."],
                ["Invoice number and date", "Sequential, unique per exporter per year. Date must be on or before the shipping date."],
                ["Reference numbers", "Buyer PO, sales contract, LC number, and your shipment/booking reference."],
                ["Description of goods", "Plain-language description, NOT just an HS code. Include grade, model, material, and packaging."],
                ["HS code (HTS / tariff classification)", "Six-digit minimum; eight or ten digits for the destination country when known."],
                ["Country of origin", "Where the goods were produced or substantially transformed — not the port of loading."],
                ["Quantity and unit of measure", "Net and gross weight in kg, plus number of pieces/cartons. Must reconcile with the packing list."],
                ["Unit price, total price, currency", "Show unit price × quantity = line total. Currency in ISO code (USD, EUR, INR)."],
                ["Incoterms 2020", "E.g. FOB Mundra, CIF Rotterdam. Always pair the term with a named place."],
                ["Payment terms", "Advance, LC at sight, DA 60 days, etc. Must match the LC if one is open."],
                ["Freight and insurance", "Itemised when the Incoterm requires it (CIF, CIP). Customs adds these to the dutiable value."],
                ["Declaration and signature", "A signed statement that the invoice is true and correct, with name and title of the signatory."],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">{title}.</span>{" "}
                    <span className="text-muted-foreground">{body}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight">Valuation rules customs actually applies</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Most customs authorities follow the WTO Valuation Agreement, which uses six methods in strict hierarchy. Method
              1 — transaction value — is the price actually paid or payable for the goods when sold for export, adjusted for
              specific additions and deductions.
            </p>
            <div className="mt-5 rounded-xl border border-border bg-card p-5">
              <p className="font-medium">Dutiable value = price paid + assists + royalties + selling commissions + packing + freight & insurance to the first port of import (for CIF-basis countries) − allowable deductions.</p>
            </div>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              If you supply moulds, tools or designs to the manufacturer free of charge ("assists"), their value must be added
              to the invoice price. Royalties paid as a condition of sale are also dutiable. Buying commissions, post-import
              transport, and duties themselves are not.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight">Common mistakes that cause customs delays</h2>
            <ul className="mt-4 space-y-3">
              {[
                "Generic descriptions like \"electronic parts\" or \"machinery components\" — every line needs enough detail for the officer to classify it.",
                "HS code mismatched with the description. Officers re-classify, often into a higher-duty tariff line.",
                "Invoice total that doesn't reconcile with the packing list weight or piece count.",
                "Incoterm without a named place (\"FOB\" instead of \"FOB Nhava Sheva\").",
                "Origin marked as the port of loading rather than the country of manufacture.",
                "Missing assists or royalties — flagged in post-clearance audit and back-dated with penalty.",
                "Multiple currencies on one invoice, or currency not stated in ISO code.",
                "Unsigned invoice, or signed by someone whose name isn't printed alongside.",
              ].map((m) => (
                <li key={m} className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{m}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight">A pre-shipment checklist</h2>
            <ol className="mt-4 space-y-2 list-decimal list-inside text-muted-foreground">
              <li>Buyer, consignee and notify party verified against the LC or PO.</li>
              <li>HS code confirmed for both origin and destination tariffs.</li>
              <li>Quantities, weights and values reconcile with the packing list and BL draft.</li>
              <li>Incoterm + named place stated; freight and insurance itemised if CIF/CIP.</li>
              <li>Country of origin matches the certificate of origin you will issue.</li>
              <li>Assists, royalties and commissions disclosed where applicable.</li>
              <li>Invoice signed, dated, and numbered in sequence.</li>
            </ol>
          </section>

          <section className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-xl font-semibold tracking-tight">Generate compliant invoices automatically</h2>
            <p className="mt-2 text-muted-foreground">
              MillionDocs pulls buyers, products, HS codes and Incoterms from one source of truth, so every commercial
              invoice you generate is already reconciled with your packing list and BL.
            </p>
            <div className="mt-5">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Try MillionDocs free
              </Link>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
