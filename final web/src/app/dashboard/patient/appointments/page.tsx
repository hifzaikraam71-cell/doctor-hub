"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDate, formatTime } from "@/lib/utils";
import type { Appointment } from "@/types";

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userName, setUserName] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUserName(d.user?.fullName || ""));
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    const res = await fetch("/api/appointments");
    const data = await res.json();
    setAppointments(data.appointments || []);
  }

  async function uploadPayment(appointmentId: string) {
    if (!screenshotUrl) return;
    setUploading(appointmentId);
    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointment_id: appointmentId, screenshot_url: screenshotUrl }),
    });
    setUploading(null);
    setScreenshotUrl("");
    fetchAppointments();
  }

  return (
    <DashboardLayout role="patient" userName={userName}>
      <h2 className="mb-6 text-2xl font-bold">My Appointments</h2>

      {appointments.length === 0 ? (
        <Card><p className="text-gray-500">No appointments yet.</p></Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <Card key={apt.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">
                    Dr. {(apt.doctors as { users?: { full_name: string } })?.users?.full_name}
                  </h3>
                  <p className="text-sm text-gray-600">{apt.doctors?.specialization}</p>
                  <p className="mt-1 text-sm">
                    {formatDate(apt.appointment_date)} at {formatTime(apt.appointment_time)}
                  </p>
                  {apt.symptoms && <p className="mt-1 text-sm text-gray-500">Symptoms: {apt.symptoms}</p>}
                </div>
                <StatusBadge status={apt.status} />
              </div>

              {apt.status === "pending" && (
                <div className="mt-4 flex flex-wrap items-end gap-3 border-t pt-4">
                  <Input
                    label="Payment Screenshot URL"
                    placeholder="https://..."
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    loading={uploading === apt.id}
                    onClick={() => uploadPayment(apt.id)}
                  >
                    Upload Payment
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
