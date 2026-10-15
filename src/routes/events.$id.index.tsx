import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Clock, IndianRupee, MapPin, Pencil, Tag, User, Users } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { DeleteEventButton } from "@/components/DeleteEventButton";
import { Button } from "@/components/ui/button";
import { eventQuery, formatDate, formatTime } from "@/lib/events";

export const Route = createFileRoute("/events/$id/")({
  head: () => ({
    meta: [
      { title: "Event Details — EventSphere" },
      { name: "description", content: "Full details for this event." },
      { property: "og:title", content: "Event Details — EventSphere" },
      { property: "og:description", content: "Full details for this event." },
    ],
  }),
  component: EventDetails,
});

function EventDetails() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: e, isLoading } = useQuery(eventQuery(id));

  return (
    <AppShell>
      <Link to="/events" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !e ? (
        <p className="text-muted-foreground">This event doesn't exist.</p>
      ) : (
        <div className="rounded-2xl border bg-card shadow-card">
          <div className="flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <StatusBadge status={e.status} />
                <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">{e.type}</span>
              </div>
              <h1 className="font-display text-2xl font-bold sm:text-3xl">{e.name}</h1>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/events/$id/edit" params={{ id: e.id }}><Pencil className="h-4 w-4" /> Edit</Link>
              </Button>
              <DeleteEventButton id={e.id} name={e.name} onDeleted={() => navigate({ to: "/events" })} />
            </div>
          </div>
          <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            <Info icon={<CalendarDays />} label="Date" value={formatDate(e.date)} />
            <Info icon={<Clock />} label="Time" value={`${formatTime(e.start_time)} – ${formatTime(e.end_time)}`} />
            <Info icon={<MapPin />} label="Venue" value={e.venue} />
            <Info icon={<User />} label="Organizer" value={e.organizer} />
            <Info icon={<Users />} label="Expected Attendees" value={e.expected_attendees.toLocaleString()} />
            <Info icon={<IndianRupee />} label="Budget" value={Number(e.budget).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })} />
            <Info icon={<Tag />} label="Type" value={e.type} />
            <Info icon={<CalendarDays />} label="Created" value={new Date(e.created_at).toLocaleDateString()} />
          </div>
          <div className="p-6 sm:p-8">
            <h2 className="mb-2 font-display font-semibold">Description</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {e.description || "No description provided."}
            </p>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 bg-card p-5">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground [&_svg]:h-4 [&_svg]:w-4">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-words font-semibold">{value}</p>
      </div>
    </div>
  );
}
