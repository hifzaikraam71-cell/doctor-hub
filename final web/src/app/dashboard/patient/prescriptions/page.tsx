"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { Prescription } from "@/types";

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUserName(d.user?.fullName || ""));
    fetch("/api/prescriptions").then((r) => r.json()).then((d) => setPrescriptions(d.prescriptions || []));
  }, []);

  return (
    <DashboardLayout role="patient" userName={userName}>
      <h2 className="mb-6 text-2xl font-bold">My Prescriptions</h2>
      <p className="mb-4 text-sm text-gray-500">Prescriptions cannot be edited or removed.</p>

      {prescriptions.length === 0 ? (
        <Card><p className="text-gray-500">No prescriptions yet.</p></Card>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <Card key={rx.id}>
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">
                    Dr. {(rx.doctors as { users?: { full_name: string } })?.users?.full_name}
                  </h3>
                  <p className="text-sm text-gray-500">{formatDate(rx.created_at)}</p>
                </div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-2">Medicine</th>
                      <th className="pb-2">Dosage</th>
                      <th className="pb-2">Frequency</th>
                      <th className="pb-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rx.medicines.map((med, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-2">{med.name}</td>
                        <td className="py-2">{med.dosage}</td>
                        <td className="py-2">{med.frequency}</td>
                        <td className="py-2">{med.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rx.instructions && (
                <p className="mt-3 text-sm text-gray-600">Instructions: {rx.instructions}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
