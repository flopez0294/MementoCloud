
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  clearAccessToken,
  getAccessToken,
  getCurrentUser,
  login as apiLogin,
  register as apiRegister,
  saveAccessToken,
  type AuthUser,
} from "@/lib/auth";

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Only host/account pages belong here.
// Guest event pages remain accessible without a host account.
const AUTH_PATHS = ["/login", "/signup"];
const PROTECTED_PATHS = ["/dashboard"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authCheckFailed, setAuthCheckFailed] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // Restore the host session when the application loads.
  useEffect(() => {
    let cancelled = false;

    async function initializeAuth() {
      const token = getAccessToken();

      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (error) {
        if (cancelled) return;

        const message =
          error instanceof Error ? error.message : "";

        if (
          message === "Your session is invalid or expired."
        ) {
          clearAccessToken();
        } else {
          // A network/server failure doesn't necessarily mean
          // the stored token is invalid.
          setAuthCheckFailed(true);
          console.error("Unable to restore session:", error);
        }

        setUser(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initializeAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  // Redirect unauthenticated users from host-only pages.
  useEffect(() => {
    if (
      !loading &&
      !user &&
      !authCheckFailed &&
      isProtectedPath(pathname)
    ) {
      router.replace("/login");
    }
  }, [loading, user, authCheckFailed, pathname, router]);

  // Redirect authenticated users away from login and signup pages.
  useEffect(() => {
    if (
      !loading &&
      user &&
      AUTH_PATHS.includes(pathname)
    ) {
      router.replace("/dashboard");
    }
  }, [loading, user, pathname, router]);

  async function login(email: string, password: string) {
    setLoading(true);
    setAuthCheckFailed(false);

    try {
      const data = await apiLogin(email, password);

      saveAccessToken(data.access_token);

      const currentUser = await getCurrentUser(data.access_token);

      setUser(currentUser);
      router.replace("/dashboard");
    } catch (error) {
      clearAccessToken();
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function register(email: string, password: string) {
    // Create the account first, then sign in with those credentials.
    await apiRegister({ email, password });

    await login(email, password);
  }

  function logout() {
    clearAccessToken();
    setUser(null);
    setAuthCheckFailed(false);
    router.replace("/login");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
