import { UUID } from "crypto";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// types

export type AuthUser = {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
};

type AuthResponse = {
  access_token: string;
  token_type: string;
};

type RegisterData = {
  email: string;
  password: string;
};

export type PasswordVerify = {
  password: string;
}

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error("The API URL is not configured.");
  }

  return API_URL;
}

// User Auth

export async function register(data: RegisterData): Promise<void> {
  const response = await fetch(`${getApiUrl()}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    if (response.status === 400) {
      throw new Error(
        result?.detail?.reason ??
          (typeof result?.detail === "string"
            ? result.detail
            : "Unable to create account. The email may already be registered.")
      );
    }

    if (response.status === 422) {
      throw new Error("Please check your email and password.");
    }

    throw new Error("Registration failed. Please try again.");
  }
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const credentials = new URLSearchParams();
  credentials.set("username", email);
  credentials.set("password", password);

  const response = await fetch(`${getApiUrl()}/auth/jwt/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: credentials.toString(),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Invalid email or password.");
    }

    throw new Error("Unable to sign in. Please try again.");
  }

  const data: AuthResponse = await response.json();

  if (!data.access_token) {
    throw new Error("The server did not return an access token.");
  }

  return data;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("access_token");
}

export function saveAccessToken(token: string): void {
  localStorage.setItem("access_token", token);
}

export function clearAccessToken(): void {
  localStorage.removeItem("access_token");
}

export async function getCurrentUser(
  token: string,
): Promise<AuthUser> {
  const response = await fetch(`${getApiUrl()}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Your session is invalid or expired.");
    }

    throw new Error("Unable to retrieve your account.");
  }

  return response.json();
}

// Guest Auth

export function getStorageKey(searchId: string) {
  return `mementocloud_guest_${searchId}`;
}

export function getGuestToken(searchId: string): string | null {
  return sessionStorage.getItem(getStorageKey(searchId))
}

export async function verifyEventPassword(searchId: string, data: PasswordVerify): Promise<AuthResponse> {
  if (!searchId || searchId === "undefined") {
    throw new Error("Missing event ID.");
  }

  try {
    const response = await fetch(`${getApiUrl()}/api/event/${encodeURIComponent(searchId)}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.detail ?? "Password was not verified.");
    }

    return result as AuthResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unable to verify the event password.");
  }
}