import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import type { Child } from "@/lib/types";

interface ChildContextValue {
  children: Child[];
  selectedChild: Child | null;
  selectedChildId: string | null;
  setSelectedChildId: (id: string) => void;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ChildContext = createContext<ChildContextValue | null>(null);

export function ChildProvider({ children: node }: { children: ReactNode }) {
  const [list, setList] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("children")
      .select("*")
      .order("created_at");
    const rows = (data ?? []) as Child[];
    setList(rows);
    setSelectedChildId((prev) =>
      prev && rows.some((c) => c.id === prev) ? prev : rows[0]?.id ?? null
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectedChild = list.find((c) => c.id === selectedChildId) ?? null;

  return (
    <ChildContext.Provider
      value={{
        children: list,
        selectedChild,
        selectedChildId,
        setSelectedChildId,
        loading,
        refresh,
      }}
    >
      {node}
    </ChildContext.Provider>
  );
}

export function useChildren() {
  const ctx = useContext(ChildContext);
  if (!ctx) throw new Error("useChildren must be used within ChildProvider");
  return ctx;
}
