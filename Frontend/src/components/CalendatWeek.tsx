import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import CancelAppointment from "./CancelAppointment";
import { EditAppointmentDialog } from "./EditAppointments";
import ListAppointments from "./ListAppointments";
import { Button } from "./ui/button";

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
  getAppointments: () => void;
  refreshing?: boolean;
  token: string;
}

export function CalendarWeek({
  available_slots,
  booked_slots,
  onSelect,
  getAppointments,
  refreshing,
  token,
}: CalendarWeekProps) {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [cancelBooking, setCancelBooking] = useState<BookedSlot | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAppointmentsList, setShowAppointmentsList] = useState(false);
  const [editing, setEditing] = useState<BookedSlot | null>(null);
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
          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">
                Weekly Calendar
              </h2>
              <p className="text-sm text-muted-foreground">
                Select a time slot or view booked appointments.
              </p>
            </div>
            <div className="flex items-center">
              <Badge className="mt-2">Booked: {booked_slots.length}</Badge>
              <Badge className="mt-2 ml-2">
                Available: {available_slots.length}
              </Badge>
              <Badge className="mt-2 ml-2">
                {refreshing ? "Refreshing..." : "Up to date"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2 py-4">
            <Button onClick={() => getAppointments()}>Refresh Slots</Button>
            <Button onClick={() => setShowAppointmentsList(true)}>
              View All Appointments
            </Button>
          </div>
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
                            ? setEditing(booked)
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
                            <div className="flex items-center gap-2">
                              <Badge
                                className="text-xs opacity-70"
                                variant="secondary"
                              >
                                Booked
                              </Badge>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCancelBooking(booked!);
                                  setShowCancelDialog(true);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
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

      {editing && (
        <EditAppointmentDialog
          open={!!editing}
          onOpenChange={() => setEditing(null)}
          appointment={editing}
          onSave={getAppointments}
          token={token}
        />
      )}
      {showCancelDialog && (
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
            getAppointments();
          }}
          token={token}
        />
      )}
      {showAppointmentsList && (
        <ListAppointments
          open={showAppointmentsList}
          onClose={() => setShowAppointmentsList(false)}
          token={token}
          getAppointments={getAppointments}
        />
      )}
    </>
  );
}
