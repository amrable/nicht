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
import type { AuthUser } from "./types";

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  handleGoogleCredential: (idToken: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  requireAuth: () => Promise<AuthUser>;
};

const AuthContext = createContext<AuthState | null>(null);

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
        if (!cancelled) setUser(user);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openLoginModal = useCallback(() => setLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => {
    setLoginModalOpen(false);
    const pending = pendingResolvers.current;
    pendingResolvers.current = [];
    pending.forEach((p) => p.reject(new Error("login_cancelled")));
  }, []);

  const handleGoogleCredential = useCallback(async (idToken: string) => {
    const { user } = await loginWithGoogle(idToken);
    setUser(user);
    setLoginModalOpen(false);
    const pending = pendingResolvers.current;
    pendingResolvers.current = [];
    pending.forEach((p) => p.resolve(user));
    return user;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const requireAuth = useCallback(async () => {
    if (user) return user;
    return new Promise<AuthUser>((resolve, reject) => {
      pendingResolvers.current.push({ resolve, reject });
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
