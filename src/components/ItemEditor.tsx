import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { databases, DATABASE_ID } from "@/integrations/appwrite/client";
import { uploadImage } from "@/lib/upload";
import { toast } from "sonner";
import { ID, Permission, Role } from "appwrite";
import type { Item } from "./CardGrid";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  collectionId: "skills" | "certificates" | "projects";
  item: Item | null;
  showLinks?: boolean;
}

export function ItemEditor({ open, onOpenChange, collectionId, item, showLinks }: Props) {
  const { user, isAdmin } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [codeUrl, setCodeUrl] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(item?.title ?? "");
      setDescription(item?.description ?? "");
      setImageUrl(item?.image_url ?? null);
      setWebsiteUrl(item?.website_url ?? "");
      setCodeUrl(item?.code_url ?? "");
      setCategory(item?.category ?? "");
    }
  }, [open, item]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, collectionId);
      setImageUrl(url);
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!isAdmin || !user) {
      toast.error("Only the administrator can save changes");
      return;
    }

    if (!title.trim()) {
      toast.error("Title required");
      return;
    }

    setSaving(true);
    const payload: Record<string, any> = {
      title: title.trim(),
      description: description.trim(),
      image_url: imageUrl,
    };

    if (collectionId === "skills" && category) {
      payload.category = category;
    }

    if (showLinks) {
      payload.website_url = websiteUrl.trim() || null;
      payload.code_url = codeUrl.trim() || null;
    }

    try {
      const permissions = [
        Permission.read(Role.any()),
        Permission.write(Role.user(user.$id)),
      ];

      if (item) {
        await databases.updateDocument(
          DATABASE_ID,
          collectionId,
          item.$id,
          payload,
          permissions,
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          collectionId,
          ID.unique(),
          payload,
          permissions,
        );
      }

      toast.success(item ? "Updated" : "Created");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono">{item ? "Edit" : "Add new"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={2000} />
          </div>
          {collectionId === "skills" && (
            <div>
              <Label>Category</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All</option>
                <option value="language">Language</option>
                <option value="framework">Framework &amp; Library</option>
                <option value="tool">Tool</option>
              </select>
            </div>
          )}
          <div>
            <Label>Image</Label>
            <Input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
            {imageUrl && <img src={imageUrl} alt="preview" className="mt-2 max-h-32 rounded-md border border-border" />}
          </div>
          {showLinks && (
            <>
              <div>
                <Label>Website URL</Label>
                <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Label>Code URL</Label>
                <Input value={codeUrl} onChange={(e) => setCodeUrl(e.target.value)} placeholder="https://github.com/..." />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || uploading}>{saving ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
