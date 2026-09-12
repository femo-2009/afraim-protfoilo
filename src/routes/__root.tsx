import { useState, useEffect } from "react";
import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/hooks/use-auth";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Afraim Farag — Developer Portfolio" },
      { name: "description", content: "Portfolio of Afraim Farag — junior web developer building responsive business websites and web applications." },
      { name: "author", content: "Afraim Farag" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Afraim Farag — Developer Portfolio" },
      { name: "twitter:title", content: "Afraim Farag — Developer Portfolio" },
      { property: "og:description", content: "Portfolio of Afraim Farag — junior web developer building responsive business websites and web applications." },
      { name: "twitter:description", content: "Portfolio of Afraim Farag — junior web developer building responsive business websites and web applications." },
      { property: "og:image", content: "" },
      { name: "twitter:image", content: "" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/profile-photo.png", type: "image/png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <noscript>
          <div style={{ maxWidth: "720px", margin: "40px auto", padding: "24px", fontFamily: "Arial, sans-serif", lineHeight: 1.6 }}>
            <h1>Afraim Farag — Web Developer</h1>
            <p>
              I build responsive business websites and web applications using React, TypeScript, Next.js, Tailwind CSS, Laravel, PHP, SQL, and Firebase.
            </p>
            <p>
              Please enable JavaScript to view the complete interactive portfolio, projects, skills, and certificates.
            </p>
            <p>
              <a href="/projects">View projects</a> · <a href="/skills">View skills</a> · <a href="https://wa.me/201031043820">Contact me on WhatsApp</a>
            </p>
          </div>
        </noscript>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 100);
    const done = setTimeout(onDone, 2500);
    return () => { clearTimeout(show); clearTimeout(done); };
  }, [onDone]);

  useEffect(() => {
    import("@/integrations/appwrite/client").then(async ({ databases, DATABASE_ID }) => {
      try {
        const { documents } = await databases.listDocuments(DATABASE_ID, "profile");
        if (documents.length > 0) {
          setProfilePhoto((documents[0] as any).photo_url || null);
        }
      } catch {}
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className={`w-full max-w-lg px-6 text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-glow mb-6 overflow-hidden">
          {profilePhoto ? (
            <img src={profilePhoto} alt="Afraim Farag" className="w-full h-full object-cover" />
          ) : (
            "AF"
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
          Welcome to My{" "}
          <span className="text-primary">Portfolio</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto mb-8 font-mono">
          Building digital solutions with modern tech
        </p>

        <div className="flex justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function RootComponent() {
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />;
  }

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="border-t border-border py-4 md:py-6 mt-8 md:mt-12">
          <div className="container mx-auto px-4 flex items-center justify-center gap-3 text-[10px] md:text-xs font-mono text-muted-foreground">
            <span>Developed by Afraim Farag</span>
            <Link
              to="/admin/login"
              aria-label="Admin login"
              title="Admin"
              className="opacity-40 hover:opacity-100 hover:text-primary transition-opacity"
            >
              <Lock className="h-3 w-3" />
            </Link>
          </div>
        </footer>
        <Toaster />
      </div>
    </AuthProvider>
  );
}
