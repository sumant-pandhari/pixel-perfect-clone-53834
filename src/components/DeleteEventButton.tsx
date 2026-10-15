import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteEvent } from "@/lib/events";

export function DeleteEventButton({
  id,
  name,
  compact,
  onDeleted,
}: {
  id: string;
  name: string;
  compact?: boolean;
  onDeleted?: () => void;
}) {
  const qc = useQueryClient();
  async function confirm() {
    try {
      await deleteEvent(id);
      await qc.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted");
      onDeleted?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {compact ? (
          <Button variant="ghost" size="icon" aria-label="Delete event" className="text-destructive hover:bg-danger-soft hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="destructive"><Trash2 className="h-4 w-4" /> Delete</Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this event?</AlertDialogTitle>
          <AlertDialogDescription>
            "{name}" will be permanently removed. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
