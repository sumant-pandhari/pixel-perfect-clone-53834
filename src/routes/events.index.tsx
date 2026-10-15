import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, Pencil, Plus, Search } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { DeleteEventButton } from "@/components/DeleteEventButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EVENT_STATUSES, eventsQuery, formatDate } from "@/lib/events";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "All Events — EventSphere" },
      { name: "description", content: "Search, filter and manage all your events." },
      { property: "og:title", content: "All Events — EventSphere" },
      { property: "og:description", content: "Search, filter and manage all your events." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { data = [], isLoading, error } = useQuery(eventsQuery);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const rows = data.filter(
    (e) => e.name.toLowerCase().includes(q.toLowerCase()) && (status === "All" || e.status === status),
  );

  return (
    <AppShell>
      <PageHeader
        title="Events"
        subtitle={`${data.length} total events`}
        action={<Button asChild><Link to="/events/new"><Plus className="h-4 w-4" /> Create Event</Link></Button>}
      />
      <div className="rounded-2xl border bg-card shadow-card">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search events by name…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
            {["All", ...EVENT_STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${status === s ? "bg-card shadow-card" : "text-muted-foreground hover:text-foreground"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {["Event Name", "Type", "Date", "Venue", "Organizer", "Attendees", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading && <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
              {error && <tr><td colSpan={8} className="p-6 text-center text-destructive">Could not load events.</td></tr>}
              {!isLoading && rows.length === 0 && (
                <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">No events found.</td></tr>
              )}
              {rows.map((e) => (
                <tr key={e.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-semibold">{e.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.type}</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatDate(e.date)}</td>
                  <td className="px-4 py-3">{e.venue}</td>
                  <td className="px-4 py-3">{e.organizer}</td>
                  <td className="px-4 py-3">{e.expected_attendees.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" aria-label="View event">
                        <Link to="/events/$id" params={{ id: e.id }}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" aria-label="Edit event">
                        <Link to="/events/$id/edit" params={{ id: e.id }}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      <DeleteEventButton id={e.id} name={e.name} compact />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
