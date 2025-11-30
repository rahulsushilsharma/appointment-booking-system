import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

type AppointmentPayload = {
  name: string;
  email: string;
  phone?: string;
  reason?: string;
  start_time: string;
  end_time: string;
};

interface CreateAppointmentFormProps {
  selectedSlot: string | null; // ISO datetime from CalendarWeek
  onSuccess?: () => void;
}

export function CreateAppointmentForm({
  selectedSlot,
  onSuccess,
}: CreateAppointmentFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!selectedSlot) {
      alert("Please select a time slot");
      return;
    }

    const start = new Date(selectedSlot);
    const end = new Date(start.getTime() + 30 * 60000); // +30 minutes

    const payload: AppointmentPayload = {
      ...form,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    };

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8000/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const e = await res.json();
        alert(e.detail || "Error creating appointment");
        return;
      }

      alert("Appointment created successfully🎉");
      onSuccess?.();

      setForm({
        name: "",
        email: "",
        phone: "",
        reason: "",
      });
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full rounded-2xl shadow-xl">
      <CardHeader>
        <h2 className="text-xl font-semibold">Create Appointment</h2>
        <p className="text-sm text-muted-foreground">
          Fill in the details to book the selected slot
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Slot Preview */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            {selectedSlot ? (
              <p className="text-sm font-medium">
                Booking for:{" "}
                <span className="text-blue-600">
                  {new Date(selectedSlot).toLocaleString("en-US", {
                    timeZone: "UTC",
                  })}
                </span>
              </p>
            ) : (
              <p className="text-sm text-red-500 font-medium">
                No slot selected
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Rahul Sharma"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              required
              placeholder="rahul.sharma@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+91-9876543210"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              name="reason"
              placeholder="Consultation regarding project requirements…"
              value={form.reason}
              onChange={handleChange}
            />
          </div>

          <Button
            disabled={loading || !selectedSlot}
            onClick={handleSubmit}
            className="w-full"
          >
            {loading ? "Booking…" : "Book Appointment"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
