import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeCollection } from "@/hooks/use-realtime-collection";
import { CardGrid, type Item } from "@/components/CardGrid";
import { ItemEditor } from "@/components/ItemEditor";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Afraim Farag" },
      { name: "description", content: "Projects built by Afraim Farag." },
      { property: "og:title", content: "Projects — Afraim Farag" },
      { property: "og:description", content: "Selected projects with live demos and source code." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { isAdmin } = useAuth();
  const { data } = useRealtimeCollection<Item>("projects");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
        <div>
          <p className="font-mono text-primary text-xs tracking-[0.3em] uppercase mb-3">// my work</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            MY <span className="text-primary">PROJECTS</span>
          </h1>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditing(null); setEditorOpen(true); }} className="font-mono uppercase tracking-wider rounded-full">
            <Plus className="h-4 w-4 mr-2" /> Add project
          </Button>
        )}
      </div>
      <CardGrid items={data} table="projects" isAdmin={isAdmin} onEdit={(i) => { setEditing(i); setEditorOpen(true); }} />
      <ItemEditor open={editorOpen} onOpenChange={setEditorOpen} table="projects" item={editing} showLinks />
    </div>
  );
}
