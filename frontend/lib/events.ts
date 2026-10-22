import { getAccessToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type CreateEventData = {
  event_name: string;
  event_date: string;
  timezone: string;
  password: string;
};

export type CreateEventResponse = {
  status: string;
  event_id: string;
  search_id: string;
};

export type Event = {
  id: string;
  search_id: string;
  event_name: string;
  event_date: string;
};

export async function createEvent(data: CreateEventData): Promise<CreateEventResponse> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("You must be signed in to create an event.");
  }

  if (!API_URL) {
    throw new Error("The API URL is not configured.");
  }

  const response = await fetch(`${API_URL}/api/event`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
    }
  )
  if (response.status === 401 || response.status === 403) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof result?.detail === "string"
        ? result.detail
        : "Unable to create your event.",
    );
  }

  return result as CreateEventResponse;
}

export async function getEvents(): Promise<Event[]> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("You must be signed in to view your events.");
  }

  if (!API_URL) {
    throw new Error("The API URL is not configured.");
  }

  const response = await fetch(`${API_URL}/api/event`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error("Unable to load your events.");
  }

  return response.json();
}