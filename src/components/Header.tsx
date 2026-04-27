import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Code2, LogOut, Shield } from "lucide-react";

export function Header() {
  const { user, isAdmin } = useAuth();

  const linkClass = "text-sm font-mono text-muted-foreground hover:text-primary transition-colors";
  const activeClass = "text-primary";

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 font-mono font-bold text-lg">
          <Code2 className="h-5 w-5 text-primary" />
          <span className="text-gradient">afraim</span>
          <span className="text-muted-foreground">.dev</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className={linkClass} activeProps={{ className: activeClass }} activeOptions={{ exact: true }}>~/home</Link>
          <Link to="/skills" className={linkClass} activeProps={{ className: activeClass }}>~/skills</Link>
          <Link to="/certificates" className={linkClass} activeProps={{ className: activeClass }}>~/certificates</Link>
          <Link to="/projects" className={linkClass} activeProps={{ className: activeClass }}>~/projects</Link>
        </nav>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-primary border border-primary/40 rounded-md px-2 py-1">
              <Shield className="h-3 w-3" /> ADMIN
            </span>
          )}
          {user ? (
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Link to="/admin/login">
              <Button variant="outline" size="sm" className="font-mono">login</Button>
            </Link>
          )}
        </div>
      </div>
      <nav className="md:hidden flex items-center justify-center gap-4 pb-3 px-4 overflow-x-auto">
        <Link to="/" className={linkClass} activeProps={{ className: activeClass }} activeOptions={{ exact: true }}>home</Link>
        <Link to="/skills" className={linkClass} activeProps={{ className: activeClass }}>skills</Link>
        <Link to="/certificates" className={linkClass} activeProps={{ className: activeClass }}>certs</Link>
        <Link to="/projects" className={linkClass} activeProps={{ className: activeClass }}>projects</Link>
      </nav>
    </header>
  );
}
