import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeCollection } from "@/hooks/use-realtime-collection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { uploadImage } from "@/lib/upload";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

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

type Profile = { id: string; name: string; bio: string; photo_url: string | null };

function HomePage() {
  const { isAdmin } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const skills = useRealtimeCollection<{ id: string; title: string; image_url: string | null }>("skills");
  const certs = useRealtimeCollection<{ id: string; title: string; image_url: string | null }>("certificates");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("profile").select("*").limit(1).maybeSingle();
      setProfile(data as Profile);
    }
    load();
    const ch = supabase.channel("rt-profile")
      .on("postgres_changes", { event: "*", schema: "public", table: "profile" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="grid md:grid-cols-[1fr_320px] gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-10 bg-primary" />
              <p className="font-mono text-primary text-xs tracking-[0.3em] uppercase">
                Full Stack Developer
              </p>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
              Building Digital
              <br />
              <span className="text-primary">Solutions</span> With
              <br />
              Modern Tech
            </h1>
            <p className="mt-8 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed whitespace-pre-wrap">
              Hi, I'm <span className="text-foreground font-semibold">{profile?.name ?? "Afraim Farag"}</span>
              {profile?.bio ? <> — {profile.bio}</> : " — a passionate developer crafting performant, scalable web apps and intuitive user experiences."}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="/projects">
                <Button size="lg" className="font-mono uppercase tracking-wider rounded-full px-8">
                  View Projects
                </Button>
              </a>
              <a href="/skills">
                <Button size="lg" variant="outline" className="font-mono uppercase tracking-wider rounded-full px-8">
                  My Skills
                </Button>
              </a>
            </div>
            {isAdmin && (
              <Button variant="ghost" size="sm" className="mt-6 font-mono text-muted-foreground" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" /> Edit profile
              </Button>
            )}
          </div>
          <div className="relative mx-auto md:mx-0">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-primary/40 to-transparent blur-3xl opacity-60" />
            <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden border-2 border-primary/40 bg-muted">
              {profile?.photo_url ? (
                <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-muted-foreground text-sm">
                  no photo
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-border" />

      {/* Skills marquee */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              MY <span className="text-primary">SKILLS</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-2 font-mono">// click any skill to see it up close</p>
          </div>
          <a href="/skills" className="font-mono text-sm text-primary hover:underline">
            View All →
          </a>
        </div>
        <Marquee items={skills.data} empty="// add skills from the Skills page" />
      </section>

      <div className="border-t border-border" />

      {/* Certificates marquee */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              MY <span className="text-primary">CERTIFICATES</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-2 font-mono">// click any certificate to see it up close</p>
          </div>
          <a href="/certificates" className="font-mono text-sm text-primary hover:underline">
            View All →
          </a>
        </div>
        <Marquee items={certs.data} empty="// add certificates from the Certificates page" />
      </section>

      {profile && <ProfileEditor open={editing} onOpenChange={setEditing} profile={profile} />}
    </div>
  );
}

function Marquee({ items, empty }: { items: { id: string; title: string; image_url: string | null }[]; empty: string }) {
  if (items.length === 0) {
    return <p className="text-muted-foreground font-mono text-sm py-8 text-center">{empty}</p>;
  }
  const doubled = [...items, ...items];
  return (
    <div className="marquee-wrapper overflow-hidden">
      <div className="marquee-track">
        {doubled.map((it, idx) => (
          <div key={`${it.id}-${idx}`} className="code-card w-56 flex-shrink-0 overflow-hidden">
            <div className="aspect-video bg-muted">
              {it.image_url && <img src={it.image_url} alt={it.title} className="w-full h-full object-cover" />}
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

function ProfileEditor({ open, onOpenChange, profile }: { open: boolean; onOpenChange: (o: boolean) => void; profile: Profile }) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [photoUrl, setPhotoUrl] = useState<string | null>(profile.photo_url);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(profile.name);
      setBio(profile.bio);
      setPhotoUrl(profile.photo_url);
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
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) {
      setSaving(false);
      toast.error("You must be signed in as admin to edit the profile.");
      return;
    }
    const { error } = await supabase.from("profile").update({
      name: name.trim(),
      bio: bio.trim(),
      photo_url: photoUrl,
      updated_at: new Date().toISOString(),
    }).eq("id", profile.id);
    setSaving(false);
    if (error) toast.error(`Database error: ${error.message}`);
    else { toast.success("Profile updated"); onOpenChange(false); }
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
