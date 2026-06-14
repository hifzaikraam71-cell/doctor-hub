"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { MedicalHistory } from "@/types";

export default function PatientHistoryPage() {
  const [history, setHistory] = useState<MedicalHistory[]>([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUserName(d.user?.fullName || ""));
    fetch("/api/history").then((r) => r.json()).then((d) => setHistory(d.history || []));
  }, []);

  return (
    <DashboardLayout role="patient" userName={userName}>
      <h2 className="mb-6 text-2xl font-bold">Medical History</h2>
      <p className="mb-4 text-sm text-gray-500">Records cannot be deleted or edited by patients.</p>

      {history.length === 0 ? (
        <Card><p className="text-gray-500">No medical history records.</p></Card>
      ) : (
        <div className="space-y-4">
          {history.map((record) => (
            <Card key={record.id}>
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{record.diagnosis}</h3>
                  <p className="text-sm text-gray-600">
                    Dr. {(record.doctors as { users?: { full_name: string } })?.users?.full_name}
                  </p>
                  {record.symptoms && <p className="mt-1 text-sm">Symptoms: {record.symptoms}</p>}
                  {record.notes && <p className="mt-1 text-sm text-gray-500">{record.notes}</p>}
                </div>
                <span className="text-sm text-gray-400">{formatDate(record.created_at)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
