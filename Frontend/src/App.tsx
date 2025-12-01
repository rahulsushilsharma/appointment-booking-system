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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthScreen } from "./components/Auth";
import { Dialog, DialogContent } from "./components/ui/dialog";

function App() {
  const [availableSlots, setAvailableSlots] = useState<{
    available_slots: Slot[];
    booked_slots: BookedSlot[];
  }>({ available_slots: [], booked_slots: [] });

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BookedSlot[]>([]);
  const [searching, setSearching] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("auth_token", token || "");
    }
  }, [token]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setToken(token);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    const timeout = setTimeout(async () => {
      if (!searchQuery) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      const response = await fetch(
        `${API_URL}/appointments/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setSearchResults(data);
      setSearching(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery, token]);

  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
  });

  const format = (d: Date) =>
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

  const endOfWeek = new Date(weekStart);
  endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 4);

  const weekLabel = `${format(weekStart)} - ${format(endOfWeek)}`;

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

  async function fetchAvailableSlots(startOverride?: Date) {
    if (!token) return;
    try {
      setFetchingSlots(true);

      const start = startOverride || weekStart;
      const isoDate = start.toISOString().split("T")[0];

      const response = await fetch(
        `${API_URL}/appointments/available?start_date=${isoDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

  useEffect(() => {
    fetchAvailableSlots();
  }, [weekStart, token]);

  if (!token) {
    return <AuthScreen setToken={(t) => setToken(t)} />;
  }
  return (
    <div className="p-6 space-y-6">
      <div className="w-full mb-4">
        <Input
          placeholder="Search appointments (name, email, phone, reason)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
          className="w-full"
          name="search input"
        />
      </div>

      {searchQuery && (
        <Card className="p-4 mb-4">
          <h3 className="text-md font-medium mb-3">
            Search Results {searching && "(searching...)"}:
          </h3>

          {searchResults.length === 0 && !searching && (
            <p className="text-sm text-muted-foreground">No matches found.</p>
          )}

          <div className="space-y-3">
            {searchResults.map((appt) => (
              <div
                key={appt.id}
                className="border rounded-lg p-3 text-sm bg-card hover:bg-accent cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{appt.name}</span>

                  <Badge variant="secondary">
                    {new Date(appt.start_time).toLocaleString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    })}
                  </Badge>
                </div>

                <p className="text-muted-foreground">{appt.email}</p>
                <p className="text-muted-foreground">{appt.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
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
      <CalendarWeek
        available_slots={availableSlots.available_slots}
        booked_slots={availableSlots.booked_slots}
        onSelect={(slot) => setSelectedSlot(slot.datetime_slot)}
        getAppointments={fetchAvailableSlots}
        refreshing={fetchingSlots}
        token={token}
      />

      <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
        <DialogContent>
          <CreateAppointmentForm
            selectedSlot={selectedSlot}
            onSuccess={() => {
              fetchAvailableSlots();
              setSelectedSlot(null);
            }}
            token={token}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
