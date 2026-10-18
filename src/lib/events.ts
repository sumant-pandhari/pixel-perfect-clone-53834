import { queryOptions } from "@tanstack/react-query";

export interface EventRow {
  id: string;
  name: string;
  type: string;
  description: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string;
  organizer: string;
  expected_attendees: number;
  budget: number;
  status: string;
  created_at: string;
}

export type EventInput = {
  name: string;
  type?: string;
  description?: string | null;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  venue?: string;
  organizer?: string;
  expected_attendees?: number;
  budget?: number;
  status?: string;
};

export const EVENT_STATUSES = ["Upcoming", "Completed", "Cancelled"] as const;
export const EVENT_TYPES = [
  "Conference",
  "Wedding",
  "Corporate",
  "Concert",
  "Workshop",
  "Birthday",
  "Exhibition",
  "Other",
] as const;

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.["VITE_API_BASE_URL"]
    ? (import.meta.env["VITE_API_BASE_URL"] as string).replace(/\/+$/, "")
    : "http://localhost:5001/api");

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // Ignore non-JSON response body
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const eventsQuery = queryOptions({
  queryKey: ["events"],
  queryFn: async () => {
    return fetchJson<EventRow[]>(`${API_BASE_URL}/events`);
  },
});

export const eventQuery = (id: string) =>
  queryOptions({
    queryKey: ["events", id],
    queryFn: async () => {
      try {
        return await fetchJson<EventRow>(`${API_BASE_URL}/events/${id}`);
      } catch (err) {
        if (err instanceof Error && err.message.toLowerCase().includes("not found")) {
          return null;
        }
        throw err;
      }
    },
  });

export async function createEvent(input: EventInput): Promise<EventRow> {
  return fetchJson<EventRow>(`${API_BASE_URL}/events`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateEvent(id: string, input: EventInput): Promise<EventRow> {
  return fetchJson<EventRow>(`${API_BASE_URL}/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await fetchJson<{ message: string; id: string }>(`${API_BASE_URL}/events/${id}`, {
    method: "DELETE",
  });
}

export function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(t: string | null) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h ?? 0, m ?? 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
