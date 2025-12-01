import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_URL } from "@/lib/conts";
import { useEffect, useState } from "react";
import type { BookedSlot } from "./CalendatWeek";
import CancelAppointment from "./CancelAppointment";
import { Button } from "./ui/button";

interface ListAppointmentsProps {
  open: boolean;
  onClose: () => void;
  token: string;
}

// Display all bookings with date, time, name,
// reason. Include cancel functionality. Sort chronologically
function ListAppointments({ open, onClose, token }: ListAppointmentsProps) {
  const [appointments, setAppointments] = useState<BookedSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancled, setCancled] = useState(false);
  const [cancelBooking, setCancelBooking] = useState<BookedSlot | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  async function fetchAppointments() {
    try {
      setLoading(true);
      const response = await fetch(API_URL + "/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setAppointments(data);
      setLoading(false);
      return data;
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAppointments([]);
      setLoading(false);
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
            <Button
              variant="outline"
              onClick={() => {
                setCancled(!cancled);
              }}
            >
              {cancled ? "Show Active" : "Show Cancled"}
            </Button>
          </DialogHeader>
          {!loading && (
            <div className="space-y-4">
              <ScrollArea className="h-96 w-full space-y-4">
                {appointments.filter(
                  (appointment) => appointment.cancelled === cancled
                ).length === 0 && (
                  <div className="m-auto text-center">
                    No appointments found.
                  </div>
                )}
                {appointments
                  .filter((appointment) => appointment.cancelled === cancled)
                  .map((appointment) => (
                    <div key={appointment.id} className="p-4 border rounded-lg">
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(appointment.start_time).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Time:</strong>{" "}
                        {new Date(appointment.start_time).toLocaleTimeString()}{" "}
                        - {new Date(appointment.end_time).toLocaleTimeString()}
                      </p>
                      <p>
                        <strong>Name:</strong> {appointment.name}
                      </p>
                      <p>
                        <strong>Reason:</strong> {appointment.reason}
                      </p>
                      <p>
                        <strong>Phone:</strong> {appointment.phone}
                      </p>
                      <p>
                        <strong>Email:</strong> {appointment.email}
                      </p>
                      {!appointment.cancelled && (
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setCancelBooking(appointment);
                            setShowCancelDialog(true);
                          }}
                        >
                          Cancel Appointment
                        </Button>
                      )}
                    </div>
                  ))}
              </ScrollArea>
            </div>
          )}
          {loading && <div>Loading appointments...</div>}

          <DialogFooter>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showCancelDialog && cancelBooking && (
        <CancelAppointment
          slot={cancelBooking!}
          open={showCancelDialog}
          onClose={() => {
            setShowCancelDialog(false);
            setCancelBooking(null);
          }}
          onSuccess={() => {
            setShowCancelDialog(false);
            setCancelBooking(null);
            fetchAppointments();
          }}
          token={token}
        />
      )}
    </div>
  );
}
export default ListAppointments;
