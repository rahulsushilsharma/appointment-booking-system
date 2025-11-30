import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BookedSlot } from "./CalendatWeek";
import { Button } from "./ui/button";

interface CancelAppointmentProps {
  slot: BookedSlot;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CancelAppointment({
  slot,
  open,
  onClose,
  onSuccess,
}: CancelAppointmentProps) {
  async function cancelAppointment() {
    try {
      const response = await fetch(
        `http://localhost:8000/api/appointments/${slot.id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      onSuccess();
      onClose();

      return data;
    } catch (error) {
      console.error("Error fetching available slots:", error);
      onClose();

      return [];
    }
  }
  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to cancel this appointment with{" "}
              <strong>{slot.name}</strong> on{" "}
              <strong>
                {new Date(slot.start_time).toLocaleString("en-US", {
                  timeZone: "UTC",
                })}
              </strong>
            </p>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button variant="destructive" onClick={cancelAppointment}>
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CancelAppointment;
