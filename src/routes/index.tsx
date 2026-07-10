import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { databases, DATABASE_ID, appwriteClient } from "@/integrations/appwrite/client";
import { Permission, Role, ID } from "appwrite";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeCollection } from "@/hooks/use-realtime-collection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { uploadImage } from "@/lib/upload";
import { toast } from "sonner";
import { Pencil, MessageCircle } from "lucide-react";
import type { ProfileDocument } from "@/integrations/appwrite/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Afraim Farag — Developer Portfolio" },
      { name: "description", content: "Welcome to the portfolio of Afraim Farag. Explore skills, certifications, and projects." },
      { property: "og:title", content: "Afraim Farag — Developer Portfolio" },
      { property: "og:description", content: "Welcome to the portfolio of Afraim Farag." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { isAdmin } = useAuth();
  const [profile, setProfile] = useState<ProfileDocument | null>(null);
  const [editing, setEditing] = useState(false);
  const skills = useRealtimeCollection<{ $id: string; title: string; image_url: string | null }>("skills");
  const certs = useRealtimeCollection<{ $id: string; title: string; image_url: string | null }>("certificates");

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    async function load() {
      const { documents } = await databases.listDocuments(DATABASE_ID, "profile");
      if (!cancelled && documents.length > 0) {
        setProfile(documents[0] as unknown as ProfileDocument);
      }
    }
    load();

    if (typeof window !== "undefined") {
      try {
        unsub = appwriteClient.subscribe(
          `databases.${DATABASE_ID}.collections.profile.documents`,
          () => load()
        );
      } catch {}
    }

    return () => { cancelled = true; if (unsub) unsub(); };
  }, []);

  return (
    <div>
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-32">
        <div className="grid md:grid-cols-[1fr_280px] gap-10 md:gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4 md:mb-6 animate-fade-up">
              <span className="h-px w-8 md:w-10 bg-primary" />
              <p className="font-mono text-primary text-[10px] md:text-xs tracking-[0.3em] uppercase cursor-blink">
                Full Stack Developer
              </p>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight animate-fade-up animate-fade-up-delay-1">
              Building Digital
              <br />
              <span className="text-primary">Solutions</span> With
              <br />
              Modern Tech
            </h1>
            <p className="mt-6 md:mt-8 text-sm md:text-lg text-muted-foreground max-w-xl leading-relaxed whitespace-pre-wrap animate-fade-up animate-fade-up-delay-2">
              Hi, I'm <span className="text-foreground font-semibold">{profile?.name ?? "Afraim Farag"}</span>
              {profile?.bio ? <> — {profile.bio}</> : " — a passionate developer crafting performant, scalable web apps and intuitive user experiences."}
            </p>
            <div className="mt-8 md:mt-10 flex flex-wrap gap-3 animate-fade-up animate-fade-up-delay-3">
              <a href="/projects">
                <Button size="default" className="font-mono uppercase tracking-wider rounded-full px-6 md:px-8 text-xs md:text-sm">
                  View Projects
                </Button>
              </a>
              <a href="/skills">
                <Button size="default" variant="outline" className="font-mono uppercase tracking-wider rounded-full px-6 md:px-8 text-xs md:text-sm">
                  My Skills
                </Button>
              </a>
              <a href="https://wa.me/201031043820" target="_blank" rel="noopener noreferrer">
                <Button size="default" variant="outline" className="font-mono uppercase tracking-wider rounded-full px-6 md:px-8 text-xs md:text-sm">
                  <MessageCircle className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5" /> WhatsApp
                </Button>
              </a>
            </div>
            {isAdmin && (
              <Button variant="ghost" size="sm" className="mt-4 md:mt-6 font-mono text-muted-foreground text-xs" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit profile
              </Button>
            )}
          </div>
          <div className="relative mx-auto md:mx-0">
            <div className="absolute -inset-3 md:-inset-4 rounded-full bg-gradient-to-br from-primary/40 to-transparent blur-3xl opacity-60" />
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-2 border-primary/40 bg-muted">
              {profile?.photo_url ? (
                <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-muted-foreground text-xs md:text-sm">
                  no photo
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-border" />

      <section className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="flex items-end justify-between mb-6 md:mb-10 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
              MY <span className="text-primary">SKILLS</span>
            </h2>
            <p className="text-[11px] md:text-sm text-muted-foreground mt-1 md:mt-2 font-mono">// click any skill to see it up close</p>
          </div>
          <a href="/skills" className="font-mono text-xs md:text-sm text-primary hover:underline">
            View All →
          </a>
        </div>
        <Marquee items={skills.data} empty="// add skills from the Skills page" />
      </section>

      <div className="border-t border-border" />

      <section className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="flex items-end justify-between mb-6 md:mb-10 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
              MY <span className="text-primary">CERTIFICATES</span>
            </h2>
            <p className="text-[11px] md:text-sm text-muted-foreground mt-1 md:mt-2 font-mono">// click any certificate to see it up close</p>
          </div>
          <a href="/certificates" className="font-mono text-xs md:text-sm text-primary hover:underline">
            View All →
          </a>
        </div>
        <Marquee items={certs.data} empty="// add certificates from the Certificates page" />
      </section>

      <ProfileEditor open={editing} onOpenChange={setEditing} profile={profile} />
    </div>
  );
}

function Marquee({ items, empty }: { items: { $id: string; title: string; image_url: string | null }[]; empty: string }) {
  const withImages = items.filter((it) => it.image_url);
  if (withImages.length === 0) {
    return <p className="text-muted-foreground font-mono text-sm py-8 text-center">{empty}</p>;
  }
  const repeated = Array.from({ length: Math.ceil(12 / withImages.length) }, () => withImages).flat();
  return (
    <div className="marquee-wrapper overflow-hidden">
      <div className="marquee-track">
        {repeated.map((it, idx) => (
          <div key={`${it.$id}-${idx}`} className="code-card w-56 flex-shrink-0 overflow-hidden">
            <div className="aspect-video bg-muted">
              <img src={it.image_url!} alt={it.title} className="w-full h-full object-contain p-2" />
            </div>
            <div className="p-3 font-mono text-sm">
              <span className="text-primary">&gt;</span> {it.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileEditor({ open, onOpenChange, profile }: { open: boolean; onOpenChange: (o: boolean) => void; profile: ProfileDocument | null }) {
  const [name, setName] = useState(profile?.name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(profile?.photo_url ?? null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(profile?.name ?? "");
      setBio(profile?.bio ?? "");
      setPhotoUrl(profile?.photo_url ?? null);
    }
  }, [open, profile]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "profile");
      setPhotoUrl(url);
      toast.success("Photo uploaded");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const data = { name: name.trim(), bio: bio.trim(), photo_url: photoUrl };
      if (profile) {
        await databases.updateDocument(DATABASE_ID, "profile", profile.$id, data, [
          Permission.read(Role.any()),
          Permission.write(Role.any()),
        ]);
      } else {
        await databases.createDocument(DATABASE_ID, "profile", ID.unique(), data, [
          Permission.read(Role.any()),
          Permission.write(Role.any()),
        ]);
      }
      toast.success("Profile saved");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-mono">Edit profile</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} /></div>
          <div><Label>Bio</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={6} maxLength={2000} /></div>
          <div>
            <Label>Photo</Label>
            <Input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
            {photoUrl && <img src={photoUrl} alt="preview" className="mt-2 w-32 h-32 object-cover rounded-full border border-border" />}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || uploading}>{saving ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
