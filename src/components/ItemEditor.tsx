import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/upload";
import { toast } from "sonner";
import type { Item } from "./CardGrid";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  table: "skills" | "certificates" | "projects";
  item: Item | null;
  showLinks?: boolean;
}

export function ItemEditor({ open, onOpenChange, table, item, showLinks }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [codeUrl, setCodeUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(item?.title ?? "");
      setDescription(item?.description ?? "");
      setImageUrl(item?.image_url ?? null);
      setWebsiteUrl(item?.website_url ?? "");
      setCodeUrl(item?.code_url ?? "");
    }
  }, [open, item]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, table);
      setImageUrl(url);
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Title required");
      return;
    }
    setSaving(true);
    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      image_url: imageUrl,
    };
    if (showLinks) {
      payload.website_url = websiteUrl.trim() || null;
      payload.code_url = codeUrl.trim() || null;
    }
    const { error } = item
      ? await supabase.from(table).update(payload).eq("id", item.id)
      : await supabase.from(table).insert(payload);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success(item ? "Updated" : "Created");
      onOpenChange(false);
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
