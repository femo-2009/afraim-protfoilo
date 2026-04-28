import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";

export function Header() {
  const { user, isAdmin } = useAuth();

  const linkClass =
    "text-xs font-mono tracking-widest text-muted-foreground hover:text-primary transition-colors uppercase";
  const activeClass = "text-primary";

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2 font-mono font-bold text-lg tracking-tight">
          <span className="text-foreground">AFRAIM</span>
          <span className="text-primary">FARAG</span>
          <span className="hidden sm:inline text-muted-foreground text-xs ml-2">// DEV PORTFOLIO</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className={linkClass} activeProps={{ className: activeClass }} activeOptions={{ exact: true }}>
            Home
          </Link>
          <Link to="/skills" className={linkClass} activeProps={{ className: activeClass }}>
            Skills
          </Link>
          <Link to="/certificates" className={linkClass} activeProps={{ className: activeClass }}>
            Certificates
          </Link>
          <Link to="/projects" className={linkClass} activeProps={{ className: activeClass }}>
            Projects
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-primary border border-primary/40 rounded-md px-2 py-1">
              <Shield className="h-3 w-3" /> ADMIN
            </span>
          )}
          {user && (
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <nav className="md:hidden flex items-center justify-center gap-5 pb-3 px-4 overflow-x-auto">
        <Link to="/" className={linkClass} activeProps={{ className: activeClass }} activeOptions={{ exact: true }}>
          Home
        </Link>
        <Link to="/skills" className={linkClass} activeProps={{ className: activeClass }}>
          Skills
        </Link>
        <Link to="/certificates" className={linkClass} activeProps={{ className: activeClass }}>
          Certs
        </Link>
        <Link to="/projects" className={linkClass} activeProps={{ className: activeClass }}>
          Projects
        </Link>
      </nav>
    </header>
  );
}
