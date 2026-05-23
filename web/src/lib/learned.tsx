import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { listLearned, markLearned, unmarkLearned } from "./api";
import { track } from "./analytics";
import { useAuth } from "./auth";

type LearnedState = {
  learnedIds: Set<number>;
  loading: boolean;
  isLearned: (id: number) => boolean;
  toggle: (id: number) => Promise<void>;
};

const LearnedContext = createContext<LearnedState | null>(null);

export function LearnedProvider({ children }: { children: ReactNode }) {
  const { user, requireAuth } = useAuth();
  const [learnedIds, setLearnedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLearnedIds(new Set());
      return;
    }
    let cancelled = false;
    setLoading(true);
    listLearned()
      .then(({ learnedIds: ids }) => {
        if (!cancelled) setLearnedIds(new Set(ids));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isLearned = useCallback((id: number) => learnedIds.has(id), [learnedIds]);

  const toggle = useCallback(
    async (id: number) => {
      await requireAuth();
      if (learnedIds.has(id)) {
        setLearnedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        try {
          await unmarkLearned(id);
        } catch {
          setLearnedIds((prev) => new Set([...prev, id]));
        }
      } else {
        setLearnedIds((prev) => new Set([...prev, id]));
        try {
          await markLearned(id);
          track("sentence_learned", { sentenceId: id });
        } catch {
          setLearnedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      }
    },
    [learnedIds, requireAuth],
  );

  const value = useMemo<LearnedState>(
    () => ({ learnedIds, loading, isLearned, toggle }),
    [learnedIds, loading, isLearned, toggle],
  );

  return <LearnedContext.Provider value={value}>{children}</LearnedContext.Provider>;
}

export function useLearned() {
  const ctx = useContext(LearnedContext);
  if (!ctx) throw new Error("useLearned must be used within LearnedProvider");
  return ctx;
}
