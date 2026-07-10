import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { account } from "@/integrations/appwrite/client";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { to: "/", label: "Home", exact: true },
  { to: "/skills", label: "Skills" },
  { to: "/certificates", label: "Certificates" },
  { to: "/projects", label: "Projects" },
];

export function Header() {
  const { user, isAdmin, refresh } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass =
    "text-xs font-mono tracking-widest text-muted-foreground hover:text-primary transition-colors uppercase";
  const activeClass = "text-primary";

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6 py-4 md:py-5">
        <Link to="/" className="flex items-center gap-2 font-mono font-bold text-base md:text-lg tracking-tight" onClick={() => setMenuOpen(false)}>
          <span className="text-foreground">AFRAIM</span>
          <span className="text-primary">FARAG</span>
          <span className="hidden sm:inline text-muted-foreground text-xs ml-2">// DEV PORTFOLIO</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className={linkClass} activeProps={{ className: activeClass }} activeOptions={l.exact ? { exact: true } : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-primary border border-primary/40 rounded-md px-2 py-1">
              <Shield className="h-3 w-3" /> ADMIN
            </span>
          )}
          {user && (
            <Button variant="ghost" size="sm" onClick={async () => { await account.deleteSession("current"); await refresh(); navigate({ to: "/" }); }} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm font-mono tracking-widest text-muted-foreground hover:text-primary transition-colors uppercase py-2"
                activeProps={{ className: "text-primary" }}
                activeOptions={l.exact ? { exact: true } : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
