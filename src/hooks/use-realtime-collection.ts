import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRealtimeCollection<T = any>(table: "skills" | "certificates" | "projects") {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: rows } = await supabase.from(table).select("*").order("created_at", { ascending: false });
      if (!cancelled) {
        setData((rows ?? []) as T[]);
        setLoading(false);
      }
    }
    load();

    const channel = supabase
      .channel(`rt-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => load())
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [table]);

  return { data, loading };
}
