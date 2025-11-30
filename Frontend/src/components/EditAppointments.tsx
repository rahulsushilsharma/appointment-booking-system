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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: BookedSlot;
  onSave: () => void;
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
      headers: { "Content-Type": "application/json" },
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

          {/* Show/update times in UTC */}
          <Input
            name="start_time"
            value={form.start_time}
            onChange={update}
            type="datetime-local"
          />
          <Input
            name="end_time"
            value={form.end_time}
            onChange={update}
            type="datetime-local"
          />
        </div>

        <Button onClick={submit} className="w-full">
          Save Changes
        </Button>
      </DialogContent>
    </Dialog>
  );
}
