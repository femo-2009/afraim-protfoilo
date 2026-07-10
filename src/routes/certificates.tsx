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
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="flex items-center justify-between mb-6 md:mb-12 flex-wrap gap-3">
        <div>
          <p className="font-mono text-primary text-[10px] md:text-xs tracking-[0.3em] uppercase mb-2 md:mb-3">// achievements</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            MY <span className="text-primary">CERTIFICATES</span>
          </h1>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditing(null); setEditorOpen(true); }} className="font-mono uppercase tracking-wider rounded-full text-xs md:text-sm">
            <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5" /> Add certificate
          </Button>
        )}
      </div>
      <CardGrid items={data} collectionId="certificates" isAdmin={isAdmin} onEdit={(i) => { setEditing(i); setEditorOpen(true); }} />
      <ItemEditor open={editorOpen} onOpenChange={setEditorOpen} collectionId="certificates" item={editing} />
    </div>
  );
}
