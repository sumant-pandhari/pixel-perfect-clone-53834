import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_STATUSES, EVENT_TYPES, type EventInput, type EventRow } from "@/lib/events";

const selectCls =
  "flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function EventForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: EventRow;
  submitLabel: string;
  onSubmit: (v: EventInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [v, setV] = useState({
    name: initial?.name ?? "",
    type: initial?.type ?? "Conference",
    description: initial?.description ?? "",
    date: initial?.date ?? "",
    start_time: initial?.start_time?.slice(0, 5) ?? "",
    end_time: initial?.end_time?.slice(0, 5) ?? "",
    venue: initial?.venue ?? "",
    organizer: initial?.organizer ?? "",
    expected_attendees: String(initial?.expected_attendees ?? ""),
    budget: String(initial?.budget ?? ""),
    status: initial?.status ?? "Upcoming",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) =>
    setV((p) => ({ ...p, [k]: e.target.value }));

  async function handle(e: FormEvent) {
    e.preventDefault();
    if (v.start_time && v.end_time && v.end_time <= v.start_time) {
      setError("End time must be after start time.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        name: v.name.trim(),
        type: v.type,
        description: v.description.trim() || null,
        date: v.date,
        start_time: v.start_time || null,
        end_time: v.end_time || null,
        venue: v.venue.trim(),
        organizer: v.organizer.trim(),
        expected_attendees: Number(v.expected_attendees) || 0,
        budget: Number(v.budget) || 0,
        status: v.status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save event.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handle} className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Event Name" className="sm:col-span-2">
          <Input required maxLength={150} value={v.name} onChange={set("name")} placeholder="Annual Tech Summit" />
        </Field>
        <Field label="Event Type">
          <select className={selectCls} value={v.type} onChange={set("type")}>
            {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className={selectCls} value={v.status} onChange={set("status")}>
            {EVENT_STATUSES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <Textarea rows={4} maxLength={2000} value={v.description} onChange={set("description")} />
        </Field>
        <Field label="Date">
          <Input type="date" required value={v.date} onChange={set("date")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Time">
            <Input type="time" value={v.start_time} onChange={set("start_time")} />
          </Field>
          <Field label="End Time">
            <Input type="time" value={v.end_time} onChange={set("end_time")} />
          </Field>
        </div>
        <Field label="Venue">
          <Input required maxLength={200} value={v.venue} onChange={set("venue")} />
        </Field>
        <Field label="Organizer">
          <Input required maxLength={150} value={v.organizer} onChange={set("organizer")} />
        </Field>
        <Field label="Expected Attendees">
          <Input type="number" min={0} value={v.expected_attendees} onChange={set("expected_attendees")} />
        </Field>
        <Field label="Budget">
          <Input type="number" min={0} step="0.01" value={v.budget} onChange={set("budget")} />
        </Field>
      </div>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <div className="mt-8 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : submitLabel}</Button>
      </div>
    </form>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <Label className="mb-2 block text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}
