import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { API_URL } from "@/lib/conts";
import { useState } from "react";
import type { BookedSlot } from "./CalendatWeek";

export function EditAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onSave,
  token,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: BookedSlot;
  onSave: () => void;
  token?: string;
}) {
  const [form, setForm] = useState(appointment);

  const update = (e: { target: { name: string; value: unknown } }) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      reason: form.reason,
      start_time: form.start_time,
      end_time: form.end_time,
    };

    const res = await fetch(API_URL + `/appointments/${form.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.detail);
      return;
    }

    onSave();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <Input
            name="name"
            value={form.name}
            onChange={update}
            placeholder="Full Name"
          />
          <Input
            name="email"
            value={form.email}
            onChange={update}
            placeholder="Email"
          />
          <Input
            name="phone"
            value={form.phone || ""}
            onChange={update}
            placeholder="Phone"
          />
          <Textarea
            name="reason"
            value={form.reason || ""}
            onChange={update}
            placeholder="Reason"
          />

          <div className="grid gap-3">
            <Input
              type="date"
              name="date"
              value={form.start_time.split("T")[0]}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                const newDate = e.target.value;
                const day = new Date(newDate).getUTCDay();

                if (day === 0 || day === 6) {
                  alert("Cannot select weekends");
                  return;
                }

                const timePart = form.start_time.slice(11, 16); // HH:MM
                const newStart = `${newDate}T${timePart}:00Z`;

                const end = new Date(newStart);
                end.setUTCMinutes(end.getUTCMinutes() + 30);

                setForm({
                  ...form,
                  start_time: newStart,
                  end_time: end.toISOString(),
                });
              }}
            />

            <select
              className="border rounded-md p-2"
              value={form.start_time.slice(11, 16)}
              onChange={(e) => {
                const date = form.start_time.split("T")[0];
                const newStart = `${date}T${e.target.value}:00Z`;

                const end = new Date(newStart);
                end.setUTCMinutes(end.getUTCMinutes() + 30);

                setForm({
                  ...form,
                  start_time: newStart,
                  end_time: end.toISOString(),
                });
              }}
            >
              <option disabled>Select time</option>
              {[
                "09:00",
                "09:30",
                "10:00",
                "10:30",
                "11:00",
                "11:30",
                "12:00",
                "12:30",
                "13:00",
                "13:30",
                "14:00",
                "14:30",
                "15:00",
                "15:30",
                "16:00",
                "16:30",
              ].map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button onClick={submit} className="w-full">
          Save Changes
        </Button>
      </DialogContent>
    </Dialog>
  );
}
