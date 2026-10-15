import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  Upcoming: "bg-info-soft text-info",
  Completed: "bg-success-soft text-success",
  Cancelled: "bg-danger-soft text-destructive",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        styles[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
