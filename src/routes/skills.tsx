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

const TABS = [
  { key: "all", label: "All" },
  { key: "language", label: "Languages" },
  { key: "framework", label: "Frameworks & Libraries" },
  { key: "tool", label: "Tools" },
];

function SkillsPage() {
  const { isAdmin } = useAuth();
  const { data } = useRealtimeCollection<Item>("skills");
  const [activeTab, setActiveTab] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  const filtered = activeTab === "all" ? data : data.filter((it) => it.category === activeTab);

  function openNew() { setEditing(null); setEditorOpen(true); }
  function openEdit(i: Item) { setEditing(i); setEditorOpen(true); }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="flex items-center justify-between mb-6 md:mb-8 flex-wrap gap-3">
        <div>
          <p className="font-mono text-primary text-[10px] md:text-xs tracking-[0.3em] uppercase mb-2 md:mb-3">// expertise</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            MY <span className="text-primary">SKILLS</span>
          </h1>
        </div>
        {isAdmin && (
          <Button onClick={openNew} className="font-mono uppercase tracking-wider rounded-full text-xs md:text-sm"><Plus className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5" /> Add skill</Button>
        )}
      </div>

      <div className="flex gap-1 mb-8 md:mb-10 border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap px-3 md:px-5 py-2.5 md:py-3 text-[11px] md:text-sm font-mono tracking-wider uppercase transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <CardGrid items={filtered} collectionId="skills" isAdmin={isAdmin} onEdit={openEdit} />
      <ItemEditor open={editorOpen} onOpenChange={setEditorOpen} collectionId="skills" item={editing} />
    </div>
  );
}
