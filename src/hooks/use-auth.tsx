import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function applySession(sess: Session | null) {
      if (!mounted) return;
      setSession(sess);
      setUser(sess?.user ?? null);

      if (!sess) {
        setIsAdmin(false);
        return;
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sess.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (mounted) setIsAdmin(Boolean(data));
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      void applySession(sess);
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      void applySession(sess).finally(() => {
        if (mounted) setLoading(false);
      });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user, loading, isAdmin };
}
