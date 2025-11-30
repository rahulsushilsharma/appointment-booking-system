import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

import "./App.css";
// 1. User Interface (Frontend)
// Calendar View: Display current week with available time slots for
// each day. 30-minute increments, 9:00 AM - 5:00 PM (Mon-Fri).
// Distinguish available vs booked slots.
// Booking Form: Select time slot and collect Name (required), Email
// (required, validated), Phone (optional), Reason/notes (optional, max
// 200 chars). Show confirmation and error messages.
// Appointments List: Display all bookings with date, time, name,
// reason. Include cancel functionality. Sort chronologically.

function App() {
  const [availableSlots, setAvailableSlots] = useState<{
    available_slots: Slot[];
    booked_slots: BookedSlot[];
  }>({ available_slots: [], booked_slots: [] });
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  async function fetchAvailableSlots() {
    try {
      const response = await fetch(
        "http://localhost:8000/api/appointments/available"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setAvailableSlots(data);
      return data;
    } catch (error) {
      console.error("Error fetching available slots:", error);
      return [];
    }
  }

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  useEffect(() => {
    console.log(
      "Available Slots:",
      availableSlots,
      "Selected Slot:",
      selectedSlot
    );
  }, [availableSlots, selectedSlot]);
  return (
    <>
      <CalendarWeek
        available_slots={availableSlots.available_slots}
        booked_slots={availableSlots.booked_slots}
        onSelect={(slot) => setSelectedSlot(slot.datetime_slot)}
      />
      <BookingForm />

      <AppointmentsList />
    </>
  );
}

export type Slot = {
  date: string;
  time: string;
  datetime_slot: string;
};

export type BookedSlot = {
  id: number;
  start_time: string;
  end_time: string;
  name: string;
  email: string;
  phone?: string;
  reason?: string;
  cancelled: boolean;
};

interface CalendarWeekProps {
  available_slots: Slot[];
  booked_slots: BookedSlot[];
  onSelect?: (slot: Slot) => void;
}

interface CalendarWeekProps {
  available_slots: Slot[];
  booked_slots: BookedSlot[];
  onSelect?: (slot: Slot) => void;
}

interface CalendarWeekProps {
  available_slots: Slot[];
  booked_slots: BookedSlot[];
  onSelect?: (slot: Slot) => void;
}

export function CalendarWeek({
  available_slots,
  booked_slots,
  onSelect,
}: CalendarWeekProps) {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [viewBooking, setViewBooking] = useState<BookedSlot | null>(null);

  const normalize = (dt: string) => (dt.endsWith("Z") ? dt : dt + "Z");

  const bookedMap = useMemo(() => {
    const map = new Map<string, BookedSlot>();
    booked_slots.forEach((b) => {
      const iso = new Date(normalize(b.start_time)).toISOString();
      map.set(iso, b);
    });
    return map;
  }, [booked_slots]);

  const grouped = useMemo(() => {
    const map: Record<string, Slot[]> = {};
    available_slots.forEach((slot) => {
      if (!map[slot.date]) map[slot.date] = [];
      map[slot.date].push(slot);
    });
    return map;
  }, [available_slots]);

  const days = Object.keys(grouped).sort();

  const prettyDay = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { weekday: "short" });

  const prettyDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });

  return (
    <>
      {/* Calendar */}
      <Card className="w-full shadow-sm rounded-xl border bg-background">
        <CardHeader>
          <h2 className="text-xl font-semibold tracking-tight">
            Weekly Calendar
          </h2>
          <p className="text-sm text-muted-foreground">
            Select a time slot or view booked appointments.
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {days.map((date) => (
              <div
                key={date}
                className="border rounded-xl p-2 bg-card shadow-sm flex flex-col"
              >
                <div className="text-center mb-3">
                  <div className="font-medium">{prettyDay(date)}</div>
                  <div className="text-sm text-muted-foreground">
                    {prettyDate(date)}
                  </div>
                </div>

                <ScrollArea className="h-[500px] pr-2">
                  {grouped[date].map((slot) => {
                    const iso = new Date(
                      normalize(slot.datetime_slot)
                    ).toISOString();
                    const booked = bookedMap.get(iso);

                    return (
                      <div
                        key={slot.datetime_slot}
                        onClick={() =>
                          booked
                            ? setViewBooking(booked)
                            : (setSelectedSlot(slot), onSelect?.(slot))
                        }
                        className={cn(
                          "w-full text-sm px-3 py-2 mb-2 rounded-lg border cursor-pointer transition-colors",

                          booked
                            ? "bg-muted text-muted-foreground border-muted hover:bg-muted"
                            : selectedSlot?.datetime_slot === slot.datetime_slot
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span>{slot.time}</span>
                          {booked && (
                            <Badge
                              className="text-xs opacity-70"
                              variant="secondary"
                            >
                              Booked
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </ScrollArea>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!viewBooking} onOpenChange={() => setViewBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>

          {viewBooking && (
            <div className="space-y-3 text-sm">
              <p>
                <strong>Name:</strong> {viewBooking.name}
              </p>
              <p>
                <strong>Email:</strong> {viewBooking.email}
              </p>
              <p>
                <strong>Phone:</strong> {viewBooking.phone || "—"}
              </p>
              <p>
                <strong>Reason:</strong> {viewBooking.reason || "—"}
              </p>
              <p>
                <strong>Start:</strong>{" "}
                {new Date(viewBooking.start_time).toLocaleString()}
              </p>
              <p>
                <strong>End:</strong>{" "}
                {new Date(viewBooking.end_time).toLocaleString()}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function BookingForm() {
  return <></>;
}

function AppointmentsList() {
  return <></>;
}

export default App;
