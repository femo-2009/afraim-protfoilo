import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ExternalLink, Code as CodeIcon } from "lucide-react";
import { databases, DATABASE_ID } from "@/integrations/appwrite/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export type Item = {
  $id: string;
  title: string;
  description: string;
  image_url: string | null;
  website_url?: string | null;
  code_url?: string | null;
  category?: string | null;
};

interface Props {
  items: Item[];
  collectionId: "skills" | "certificates" | "projects";
  isAdmin: boolean;
  onEdit: (item: Item) => void;
}

export function CardGrid({ items, collectionId, isAdmin, onEdit }: Props) {
  const { user, isAdmin: authenticatedIsAdmin } = useAuth();
  const [selected, setSelected] = useState<Item | null>(null);

  async function handleDelete(id: string) {
    if (!authenticatedIsAdmin || !user) {
      toast.error("Only the administrator can delete items");
      return;
    }

    if (!confirm("Delete this item?")) return;

    try {
      await databases.deleteDocument(DATABASE_ID, collectionId, id);
      toast.success("Deleted");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground font-mono">
        <p>// No items yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <article
            key={item.$id}
            className="code-card overflow-hidden cursor-pointer group flex flex-col"
            onClick={() => setSelected(item)}
          >
            <div className="aspect-video bg-muted overflow-hidden">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-mono text-sm">no image</div>
              )}
            </div>
            <div className="p-4 md:p-5 flex-1 flex flex-col">
              <h3 className="font-mono font-semibold text-sm md:text-base text-foreground group-hover:text-primary transition-colors">
                <span className="text-primary">&gt;</span> {item.title}
              </h3>
              {item.description && (
                <p className="mt-1.5 md:mt-2 text-xs md:text-sm text-muted-foreground line-clamp-2">{item.description}</p>
              )}
              {isAdmin && authenticatedIsAdmin && (
                <div className="mt-3 md:mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="outline" onClick={() => onEdit(item)} className="text-xs">
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.$id)} className="text-xs">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-mono text-2xl">
                  <span className="text-primary">&gt;</span> {selected.title}
                </DialogTitle>
                <DialogDescription className="sr-only">{selected.title} details</DialogDescription>
              </DialogHeader>
              {selected.image_url && (
                <div className="rounded-md overflow-hidden border border-border">
                  <img src={selected.image_url} alt={selected.title} className="w-full max-h-[400px] object-contain bg-muted" />
                </div>
              )}
              {selected.description && (
                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{selected.description}</p>
              )}
              {(selected.website_url || selected.code_url) && (
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  {selected.website_url && (
                    <a href={selected.website_url} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                      <Button className="w-full font-mono">
                        <ExternalLink className="h-4 w-4 mr-2" /> Live site
                      </Button>
                    </a>
                  )}
                  {selected.code_url && (
                    <a href={selected.code_url} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full font-mono">
                        <CodeIcon className="h-4 w-4 mr-2" /> View code
                      </Button>
                    </a>
                  )}
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
