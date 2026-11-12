"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { verifyEventPassword as apiVerifyPassword, getStorageKey } from "@/lib/auth";

type GuestAuthContextType = {
  guestToken: string | null;
  guestSearchId: string | null;
  isGuestAuthenticated: boolean;
  isVerifying: boolean;
  verifyEventPassword: (
    searchId: string,
    password: string
  ) => Promise<void>;
  restoreGuestSession: (searchId: string) => void;
  clearGuestSession: (searchId?: string) => void;
};

const GuestAuthContext = createContext<GuestAuthContextType | null>(null);



export function GuestAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [guestSearchId, setGuestSearchId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Verify the event password with the backend.
  const verifyEventPassword = useCallback(
    async (searchId: string, password: string) => {
      setIsVerifying(true);

      try {
        const data = await apiVerifyPassword(searchId, { password });

        if (!data) {
          throw new Error("Password was not verifies");
        }

        // Adjust this if your backend uses a different response field.
        const token = data?.access_token;

        if (typeof token !== "string" || !token) {
          throw new Error(
            "The server did not return an access token."
          );
        }

        // Keep guest authentication separate from host authentication.
        sessionStorage.setItem(getStorageKey(searchId), token);

        setGuestToken(token);
        setGuestSearchId(searchId);
      } finally {
        setIsVerifying(false);
      }
    },
    []
  );

  // Restore a guest session when the guest revisits an event.
  const restoreGuestSession = useCallback((searchId: string) => {
    const token = sessionStorage.getItem(getStorageKey(searchId));

    setGuestToken(token);
    setGuestSearchId(token ? searchId : null);
  }, []);

  // Clear one event's session, or all guest sessions if no ID is given.
  const clearGuestSession = useCallback((searchId?: string) => {
    if (searchId) {
      sessionStorage.removeItem(getStorageKey(searchId));

      setGuestToken((currentToken) =>
        guestSearchId === searchId ? null : currentToken
      );

      setGuestSearchId((currentId) =>
        currentId === searchId ? null : currentId
      );

      return;
    }

    // Only remove guest-session keys, not host authentication.
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);

      if (key?.startsWith("mementocloud_guest_")) {
        sessionStorage.removeItem(key);
      }
    }

    setGuestToken(null);
    setGuestSearchId(null);
  }, [guestSearchId]);

  const value: GuestAuthContextType = {
    guestToken,
    guestSearchId,
    isGuestAuthenticated: Boolean(guestToken && guestSearchId),
    isVerifying,
    verifyEventPassword,
    restoreGuestSession,
    clearGuestSession,
  };

  return (
    <GuestAuthContext.Provider value={value}>
      {children}
    </GuestAuthContext.Provider>
  );
}

// Use this hook in components that need guest authentication.
export function useGuestAuth() {
  const context = useContext(GuestAuthContext);

  if (!context) {
    throw new Error(
      "useGuestAuth must be used inside a GuestAuthProvider"
    );
  }

  return context;
}
