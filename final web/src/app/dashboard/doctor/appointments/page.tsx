"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate, formatTime } from "@/lib/utils";
import type { Appointment } from "@/types";

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUserName(d.user?.fullName || ""));
    fetch("/api/appointments").then((r) => r.json()).then((d) => setAppointments(d.appointments || []));
  }, []);

  return (
    <DashboardLayout role="doctor" userName={userName}>
      <h2 className="mb-6 text-2xl font-bold">Appointments</h2>
      {appointments.length === 0 ? (
        <Card><p className="text-gray-500">No appointments.</p></Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <Card key={apt.id}>
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">
                    {(apt.patients as { users?: { full_name: string } })?.users?.full_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(apt.appointment_date)} at {formatTime(apt.appointment_time)}
                  </p>
                  {apt.symptoms && <p className="mt-1 text-sm">Symptoms: {apt.symptoms}</p>}
                </div>
                <StatusBadge status={apt.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
