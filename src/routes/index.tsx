import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, CalendarClock, CalendarX, CalendarDays, Plus, MapPin, Users } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { eventsQuery, formatDate } from "@/lib/events";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — EventSphere" },
      { name: "description", content: "Overview of all your events: upcoming, completed and cancelled." },
      { property: "og:title", content: "Dashboard — EventSphere" },
      { property: "og:description", content: "Overview of all your events at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data = [], isLoading } = useQuery(eventsQuery);
  const count = (s: string) => data.filter((e) => e.status === s).length;
  const stats = [
    { label: "Total Events", value: data.length, icon: CalendarDays, cls: "bg-gradient-primary text-primary-foreground" },
    { label: "Upcoming", value: count("Upcoming"), icon: CalendarClock, cls: "bg-info-soft text-info" },
    { label: "Completed", value: count("Completed"), icon: CalendarCheck, cls: "bg-success-soft text-success" },
    { label: "Cancelled", value: count("Cancelled"), icon: CalendarX, cls: "bg-danger-soft text-destructive" },
  ];
  const upcoming = data.filter((e) => e.status === "Upcoming").slice(0, 6);

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        subtitle="Here's what's happening with your events."
        action={<Button asChild><Link to="/events/new"><Plus className="h-4 w-4" /> Create Event</Link></Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-card">
            <div className={`grid h-12 w-12 place-items-center rounded-xl ${s.cls}`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="font-display text-2xl font-bold">{isLoading ? "–" : s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border bg-card shadow-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-display text-lg font-semibold">Upcoming Events</h2>
          <Link to="/events" className="text-sm font-medium text-accent-foreground hover:underline">View all</Link>
        </div>
        {isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading…</p>
        ) : upcoming.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No upcoming events yet. <Link to="/events/new" className="font-medium text-accent-foreground underline">Create one</Link>.
          </div>
        ) : (
          <ul className="divide-y">
            {upcoming.map((e) => (
              <li key={e.id}>
                <Link to="/events/$id" params={{ id: e.id }} className="flex flex-col gap-2 px-6 py-4 transition-colors hover:bg-muted sm:flex-row sm:items-center">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-center text-accent-foreground">
                    <span className="text-[10px] font-semibold uppercase leading-none">{formatDate(e.date).split(" ")[0]}</span>
                    <span className="font-display text-lg font-bold leading-none">{e.date.slice(8, 10)}</span>
                  </div>
                  <div className="min-w-0 flex-1 sm:px-4">
                    <p className="truncate font-semibold">{e.name}</p>
                    <p className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{e.venue}</span>
                      <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{e.expected_attendees}</span>
                    </p>
                  </div>
                  <StatusBadge status={e.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
