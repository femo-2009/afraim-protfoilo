import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { account, ADMIN_EMAIL } from "@/integrations/appwrite/client";
import type { Models } from "appwrite";

type AuthCtx = {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  isAdmin: false,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const check = useCallback(async () => {
    try {
      const u = await account.get();
      setUser(u);
      setIsAdmin(u.email === ADMIN_EMAIL);
    } catch {
      setUser(null);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await check();
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [check]);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, refresh: check }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
