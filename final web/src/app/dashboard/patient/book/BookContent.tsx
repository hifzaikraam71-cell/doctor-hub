"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function BookAppointmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const doctorId = searchParams.get("doctor") || "";
  const [userName, setUserName] = useState("");
  const [form, setForm] = useState({
    doctor_id: doctorId,
    appointment_date: "",
    appointment_time: "",
    symptoms: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUserName(d.user?.fullName || ""));
  }, []);

  useEffect(() => {
    if (doctorId) setForm((f) => ({ ...f, doctor_id: doctorId }));
  }, [doctorId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (res.ok) {
      setMessage("Appointment booked! Please upload payment in appointments.");
      setTimeout(() => router.push("/dashboard/patient/appointments"), 2000);
    } else {
      setMessage(data.error || "Booking failed");
    }
    setLoading(false);
  }

  return (
    <DashboardLayout role="patient" userName={userName}>
      <Card title="Book Appointment">
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <Input
            label="Date"
            type="date"
            value={form.appointment_date}
            onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
            required
          />
          <Input
            label="Time"
            type="time"
            value={form.appointment_time}
            onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
            required
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Symptoms</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              rows={3}
              value={form.symptoms}
              onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
            />
          </div>
          {message && (
            <div className={`rounded-lg p-3 text-sm ${message.includes("booked") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {message}
            </div>
          )}
          <Button type="submit" loading={loading}>Book Appointment</Button>
        </form>
      </Card>
    </DashboardLayout>
  );
}
