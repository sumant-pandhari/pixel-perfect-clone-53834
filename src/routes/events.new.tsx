import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { EventForm } from "@/components/EventForm";
import { createEvent } from "@/lib/events";

export const Route = createFileRoute("/events/new")({
  head: () => ({
    meta: [
      { title: "Create Event — EventSphere" },
      { name: "description", content: "Plan a new event with date, venue, budget and more." },
      { property: "og:title", content: "Create Event — EventSphere" },
      { property: "og:description", content: "Plan a new event in EventSphere." },
    ],
  }),
  component: NewEvent,
});

function NewEvent() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  return (
    <AppShell>
      <PageHeader title="Create Event" subtitle="Fill in the details for your new event." />
      <EventForm
        submitLabel="Create Event"
        onCancel={() => navigate({ to: "/events" })}
        onSubmit={async (v) => {
          const created = await createEvent(v);
          await qc.invalidateQueries({ queryKey: ["events"] });
          toast.success("Event created");
          navigate({ to: "/events/$id", params: { id: created.id } });
        }}
      />
    </AppShell>
  );
}
