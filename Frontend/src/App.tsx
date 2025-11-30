import { useEffect, useState } from "react";

import "./App.css";
import {
  type BookedSlot,
  CalendarWeek,
  type Slot,
} from "./components/CalendatWeek";
import { CreateAppointmentForm } from "./components/CreateAppointment";
import { API_URL } from "./lib/conts";
// 1. User Interface (Frontend)
// Calendar View: Display current week with available time slots for
// each day. 30-minute increments, 9:00 AM - 5:00 PM (Mon-Fri).
// Distinguish available vs booked slots.
// Booking Form: Select time slot and collect Name (required), Email
// (required, validated), Phone (optional), Reason/notes (optional, max
// 200 chars). Show confirmation and error messages.
// Appointments List: Display all bookings with date, time, name,
// reason. Include cancel functionality. Sort chronologically.

import { Button } from "@/components/ui/button";

function App() {
  const [availableSlots, setAvailableSlots] = useState<{
    available_slots: Slot[];
    booked_slots: BookedSlot[];
  }>({ available_slots: [], booked_slots: [] });

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  // ⭐ NEW — weekStart stored as UTC midnight
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
  });

  // ⭐ Format date for the header (Mon–Fri)
  const format = (d: Date) =>
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

  const endOfWeek = new Date(weekStart);
  endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 4);

  const weekLabel = `${format(weekStart)} - ${format(endOfWeek)}`;

  // ⭐ NEW — Navigation handlers
  const nextWeek = () => {
    const next = new Date(weekStart);
    next.setUTCDate(next.getUTCDate() + 7);
    setWeekStart(next);
  };

  const previousWeek = () => {
    const prev = new Date(weekStart);
    prev.setUTCDate(prev.getUTCDate() - 7);
    setWeekStart(prev);
  };

  // ⭐ UPDATED — Fetch Available Slots for selected week
  async function fetchAvailableSlots(startOverride?: Date) {
    try {
      setFetchingSlots(true);

      const start = startOverride || weekStart;
      const isoDate = start.toISOString().split("T")[0];

      const response = await fetch(
        `${API_URL}/appointments/available?start_date=${isoDate}`
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      setAvailableSlots(data);
      setFetchingSlots(false);

      return data;
    } catch (error) {
      setFetchingSlots(false);
      console.error("Error fetching available slots:", error);
      return [];
    }
  }

  // ⭐ Fetch when app loads
  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  // ⭐ Re-fetch when the week changes
  useEffect(() => {
    fetchAvailableSlots();
  }, [weekStart]);

  return (
    <div className="p-6 space-y-6">
      {/* ⭐ WEEK NAVIGATION UI */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{weekLabel}</h2>

        <div className="flex gap-2">
          <Button variant="outline" onClick={previousWeek}>
            Previous
          </Button>
          <Button variant="outline" onClick={nextWeek}>
            Next
          </Button>
        </div>
      </div>

      {/* ⭐ CALENDAR */}
      <CalendarWeek
        available_slots={availableSlots.available_slots}
        booked_slots={availableSlots.booked_slots}
        onSelect={(slot) => setSelectedSlot(slot.datetime_slot)}
        getAppointments={fetchAvailableSlots}
        refreshing={fetchingSlots}
      />

      {/* ⭐ SELECTED SLOT FORM */}
      <CreateAppointmentForm
        selectedSlot={selectedSlot}
        onSuccess={() => fetchAvailableSlots()}
      />

      {/* ⭐ OPTIONAL PREVIEW */}
      <AppointmentsList />
      <BookingForm />
    </div>
  );
}

function BookingForm() {
  return <></>;
}

function AppointmentsList() {
  return <></>;
}

export default App;
