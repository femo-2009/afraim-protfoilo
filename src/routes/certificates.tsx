import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeCollection } from "@/hooks/use-realtime-collection";
import { CardGrid, type Item } from "@/components/CardGrid";
import { ItemEditor } from "@/components/ItemEditor";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/certificates")({
  head: () => ({
    meta: [
      { title: "Certificates — Afraim Farag" },
      { name: "description", content: "Certifications earned by Afraim Farag." },
      { property: "og:title", content: "Certificates — Afraim Farag" },
      { property: "og:description", content: "Professional certifications." },
    ],
  }),
  component: CertsPage,
});

function CertsPage() {
  const { isAdmin } = useAuth();
  const { data } = useRealtimeCollection<Item>("certificates");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="font-mono text-primary text-sm">$ cat ./certs.json</p>
          <h1 className="text-4xl font-bold font-mono mt-1">Certificates</h1>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditing(null); setEditorOpen(true); }} className="font-mono">
            <Plus className="h-4 w-4 mr-2" /> Add certificate
          </Button>
        )}
      </div>
      <CardGrid items={data} table="certificates" isAdmin={isAdmin} onEdit={(i) => { setEditing(i); setEditorOpen(true); }} />
      <ItemEditor open={editorOpen} onOpenChange={setEditorOpen} table="certificates" item={editing} />
    </div>
  );
}
