import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { addFavorite, listFavorites, removeFavorite } from "./api";
import type { Favorite, FavoriteKind, Noun, Verb } from "./types";
import { useAuth } from "./auth";

type FavoritesState = {
  favorites: Favorite[];
  loading: boolean;
  has: (kind: FavoriteKind, key: string) => boolean;
  toggle: (
    kind: FavoriteKind,
    key: string,
    payload: Noun | Verb,
  ) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesState | null>(null);

function favKey(kind: FavoriteKind, key: string) {
  return `${kind}:${key}`;
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    listFavorites()
      .then(({ favorites }) => {
        if (!cancelled) setFavorites(favorites);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const keySet = useMemo(
    () => new Set(favorites.map((f) => favKey(f.kind, f.key))),
    [favorites],
  );

  const has = useCallback(
    (kind: FavoriteKind, key: string) => keySet.has(favKey(kind, key)),
    [keySet],
  );

  const toggle = useCallback(
    async (kind: FavoriteKind, key: string, payload: Noun | Verb) => {
      const k = favKey(kind, key);
      if (keySet.has(k)) {
        const prev = favorites;
        setFavorites((rows) => rows.filter((r) => favKey(r.kind, r.key) !== k));
        try {
          await removeFavorite(kind, key);
        } catch (err) {
          setFavorites(prev);
          throw err;
        }
      } else {
        try {
          const { favorite } = await addFavorite(kind, key, payload);
          setFavorites((rows) => {
            if (rows.some((r) => r.id === favorite.id)) return rows;
            return [favorite, ...rows];
          });
        } catch (err) {
          throw err;
        }
      }
    },
    [favorites, keySet],
  );

  const value = useMemo<FavoritesState>(
    () => ({ favorites, loading, has, toggle }),
    [favorites, loading, has, toggle],
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
