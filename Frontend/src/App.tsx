import { useEffect, useState } from "react";

import "./App.css";
import {
  type BookedSlot,
  CalendarWeek,
  type Slot,
} from "./components/CalendatWeek";
import { CreateAppointmentForm } from "./components/CreateAppointment";
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
  const [fetchingSlots, setFetchingSlots] = useState(false);

  async function fetchAvailableSlots() {
    try {
      setFetchingSlots(true);
      const response = await fetch(
        "http://localhost:8000/api/appointments/available"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
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

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  useEffect(() => {
    console.log("Available Slots:", availableSlots);
  }, [availableSlots]);
  return (
    <>
      <CalendarWeek
        available_slots={availableSlots.available_slots}
        booked_slots={availableSlots.booked_slots}
        onSelect={(slot) => setSelectedSlot(slot.datetime_slot)}
        getAppointments={fetchAvailableSlots}
        refreshing={fetchingSlots}
      />
      <BookingForm />
      <CreateAppointmentForm
        selectedSlot={selectedSlot}
        onSuccess={() => fetchAvailableSlots()}
      />
      <AppointmentsList />
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
