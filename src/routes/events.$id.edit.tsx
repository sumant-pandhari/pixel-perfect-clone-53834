import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { EventForm } from "@/components/EventForm";
import { eventQuery, updateEvent } from "@/lib/events";

export const Route = createFileRoute("/events/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Event — EventSphere" },
      { name: "description", content: "Update the details of this event." },
      { property: "og:title", content: "Edit Event — EventSphere" },
      { property: "og:description", content: "Update the details of this event." },
    ],
  }),
  component: EditEvent,
});

function EditEvent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(eventQuery(id));

  return (
    <AppShell>
      <PageHeader title="Edit Event" subtitle={data?.name} />
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !data ? (
        <p className="text-muted-foreground">This event doesn't exist.</p>
      ) : (
        <EventForm
          initial={data}
          submitLabel="Save Changes"
          onCancel={() => navigate({ to: "/events/$id", params: { id } })}
          onSubmit={async (v) => {
            await updateEvent(id, v);
            await qc.invalidateQueries({ queryKey: ["events"] });
            toast.success("Event updated");
            navigate({ to: "/events/$id", params: { id } });
          }}
        />
      )}
    </AppShell>
  );
}
