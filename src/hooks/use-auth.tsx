import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthCtx>({
  session: null,
  user: null,
  loading: true,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const lastCheckedUserId = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkAdmin(userId: string) {
      // Avoid re-querying for the same user (prevents loops on TOKEN_REFRESHED events).
      if (lastCheckedUserId.current === userId) return;
      lastCheckedUserId.current = userId;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (mounted) setIsAdmin(Boolean(data));
    }

    // 1) Subscribe FIRST (sync only inside the callback — never await Supabase here).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!mounted) return;
      setSession(sess);
      setUser(sess?.user ?? null);
      if (!sess) {
        lastCheckedUserId.current = null;
        setIsAdmin(false);
        return;
      }
      // Defer the DB call to the next tick to escape the auth callback stack.
      setTimeout(() => {
        if (mounted) void checkAdmin(sess.user.id);
      }, 0);
    });

    // 2) THEN load the existing session.
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      if (!mounted) return;
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess) {
        void checkAdmin(sess.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
