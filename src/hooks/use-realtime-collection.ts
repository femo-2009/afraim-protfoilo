import { useEffect, useState } from "react";
import { databases, DATABASE_ID, appwriteClient } from "@/integrations/appwrite/client";
import { Query } from "appwrite";

export function useRealtimeCollection<T = any>(collectionId: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    async function load() {
      const { documents } = await databases.listDocuments(DATABASE_ID, collectionId, [
        Query.orderDesc("$createdAt"),
      ]);
      if (!cancelled) {
        setData(documents as unknown as T[]);
        setLoading(false);
      }
    }
    load();

    if (typeof window !== "undefined") {
      try {
        unsub = appwriteClient.subscribe(
          `databases.${DATABASE_ID}.collections.${collectionId}.documents`,
          () => load()
        );
      } catch {}
    }

    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, [collectionId]);

  return { data, loading };
}
