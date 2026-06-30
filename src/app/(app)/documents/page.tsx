import { Topbar } from "@/components/layout/topbar";
import { FileText } from "lucide-react";

export default function DocumentsPage() {
  return (
    <>
      <Topbar title="Documents" subtitle="Generated export documents" />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-2xl mx-auto text-center py-20 border border-dashed rounded-xl border-border">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold">No documents yet</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Documents are generated per shipment from the Master File. The
            backend does not yet expose a documents table/endpoint, so there is
            nothing to list here yet. Create a shipment and its document set from
            the Shipments page.
          </p>
        </div>
      </main>
    </>
  );
}
