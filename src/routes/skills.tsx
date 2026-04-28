import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeCollection } from "@/hooks/use-realtime-collection";
import { CardGrid, type Item } from "@/components/CardGrid";
import { ItemEditor } from "@/components/ItemEditor";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Skills — Afraim Farag" },
      { name: "description", content: "Technical skills and expertise of Afraim Farag." },
      { property: "og:title", content: "Skills — Afraim Farag" },
      { property: "og:description", content: "Technical skills and expertise." },
    ],
  }),
  component: SkillsPage,
});

function SkillsPage() {
  const { isAdmin } = useAuth();
  const { data } = useRealtimeCollection<Item>("skills");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  function openNew() { setEditing(null); setEditorOpen(true); }
  function openEdit(i: Item) { setEditing(i); setEditorOpen(true); }

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
        <div>
          <p className="font-mono text-primary text-xs tracking-[0.3em] uppercase mb-3">// expertise</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            MY <span className="text-primary">SKILLS</span>
          </h1>
        </div>
        {isAdmin && (
          <Button onClick={openNew} className="font-mono uppercase tracking-wider rounded-full"><Plus className="h-4 w-4 mr-2" /> Add skill</Button>
        )}
      </div>
      <CardGrid items={data} table="skills" isAdmin={isAdmin} onEdit={openEdit} />
      <ItemEditor open={editorOpen} onOpenChange={setEditorOpen} table="skills" item={editing} />
    </div>
  );
}
