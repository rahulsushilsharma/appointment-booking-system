import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import type { BookedSlot } from "./CalendatWeek";
import { Button } from "./ui/button";

interface ListAppointmentsProps {
  open: boolean;
  onClose: () => void;
}

// Display all bookings with date, time, name,
// reason. Include cancel functionality. Sort chronologically
function ListAppointments({ open, onClose }: ListAppointmentsProps) {
  const [appointments, setAppointments] = useState<BookedSlot[]>([]);
  async function fetchAppointments() {
    try {
      const response = await fetch("http://localhost:8000/api/appointments");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setAppointments(data);
      return data;
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAppointments([]);
      return [];
    }
  }
  useEffect(() => {
    fetchAppointments();
  }, []);
  return (
    <div>
      {" "}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ScrollArea className="h-96 w-full space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="p-4 border rounded-lg">
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(appointment.start_time).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time:</strong>{" "}
                    {new Date(appointment.start_time).toLocaleTimeString()} -{" "}
                    {new Date(appointment.end_time).toLocaleTimeString()}
                  </p>
                  <p>
                    <strong>Name:</strong> {appointment.name}
                  </p>
                  <p>
                    <strong>Reason:</strong> {appointment.reason}
                  </p>
                </div>
              ))}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default ListAppointments;
