"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function DoctorHistoryPage() {
  const [userName, setUserName] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    patient_id: "",
    diagnosis: "",
    symptoms: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUserName(d.user?.fullName || ""));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage(res.ok ? "Medical history added" : data.error);
  }

  return (
    <DashboardLayout role="doctor" userName={userName}>
      <Card title="Add Medical History">
        <p className="mb-4 text-sm text-gray-500">Records cannot be deleted. Only new records can be added.</p>
        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          <Input label="Patient ID" value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} required />
          <Input label="Diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} required />
          <Input label="Symptoms" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Notes</label>
            <textarea className="w-full rounded-lg border px-3 py-2 text-sm" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          {message && <p className="text-sm text-green-600">{message}</p>}
          <Button type="submit">Add Record</Button>
        </form>
      </Card>
    </DashboardLayout>
  );
}
