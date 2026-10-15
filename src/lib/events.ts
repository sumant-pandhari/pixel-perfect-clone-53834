import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type EventInput = Database["public"]["Tables"]["events"]["Insert"];

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

export const eventsQuery = queryOptions({
  queryKey: ["events"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });
    if (error) throw error;
    return data;
  },
});

export const eventQuery = (id: string) =>
  queryOptions({
    queryKey: ["events", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export async function createEvent(input: EventInput) {
  const { data, error } = await supabase.from("events").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id: string, input: EventInput) {
  const { error } = await supabase.from("events").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
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
  d.setHours(h, m);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
