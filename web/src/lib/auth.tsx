import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getMe, loginWithGoogle, logout as apiLogout } from "./api";
import {
  identifyUser,
  isFirstTimeUser,
  resetAnalytics,
  track,
} from "./analytics";
import type { AuthUser } from "./types";

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  loginModalOpen: boolean;
  openLoginModal: (source?: "favorites" | "gated_action") => void;
  closeLoginModal: () => void;
  handleGoogleCredential: (idToken: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  requireAuth: () => Promise<AuthUser>;
};

const AuthContext = createContext<AuthState | null>(null);

const USER_CACHE_KEY = "satzbau_user";

function cacheUser(user: AuthUser | null) {
  try {
    if (user) {
      localStorage.setItem(
        USER_CACHE_KEY,
        JSON.stringify({
          name: user.name,
          email: user.email,
          picture: user.picture,
        }),
      );
    } else {
      localStorage.removeItem(USER_CACHE_KEY);
    }
  } catch {
    // ignore storage failures
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const pendingResolvers = useRef<
    Array<{ resolve: (u: AuthUser) => void; reject: (e: unknown) => void }>
  >([]);

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then(({ user }) => {
        if (!cancelled) {
          setUser(user);
          cacheUser(user);
          if (user) identifyUser(user);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openLoginModal = useCallback(
    (source: "favorites" | "gated_action" = "favorites") => {
      track("login_modal_shown", { source });
      setLoginModalOpen(true);
    },
    [],
  );
  const closeLoginModal = useCallback(() => {
    setLoginModalOpen(false);
    const pending = pendingResolvers.current;
    pendingResolvers.current = [];
    pending.forEach((p) => p.reject(new Error("login_cancelled")));
  }, []);

  const handleGoogleCredential = useCallback(async (idToken: string) => {
    const { user } = await loginWithGoogle(idToken);
    setUser(user);
    cacheUser(user);
    identifyUser(user, { fromLogin: true });
    if (isFirstTimeUser(user.id)) {
      track("signup");
    }
    track("login");
    setLoginModalOpen(false);
    const pending = pendingResolvers.current;
    pendingResolvers.current = [];
    pending.forEach((p) => p.resolve(user));
    return user;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    cacheUser(null);
    resetAnalytics();
  }, []);

  const requireAuth = useCallback(async () => {
    if (user) return user;
    return new Promise<AuthUser>((resolve, reject) => {
      pendingResolvers.current.push({ resolve, reject });
      track("login_modal_shown", { source: "gated_action" });
      setLoginModalOpen(true);
    });
  }, [user]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      loginModalOpen,
      openLoginModal,
      closeLoginModal,
      handleGoogleCredential,
      logout,
      requireAuth,
    }),
    [
      user,
      loading,
      loginModalOpen,
      openLoginModal,
      closeLoginModal,
      handleGoogleCredential,
      logout,
      requireAuth,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
