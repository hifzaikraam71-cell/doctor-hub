"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function DoctorPrescriptionsPage() {
  const [userName, setUserName] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    patient_id: "",
    medicines: [{ name: "", dosage: "", frequency: "", duration: "" }],
    instructions: "",
  });

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUserName(d.user?.fullName || ""));
  }, []);

  function addMedicine() {
    setForm({
      ...form,
      medicines: [...form.medicines, { name: "", dosage: "", frequency: "", duration: "" }],
    });
  }

  function updateMedicine(index: number, field: string, value: string) {
    const meds = [...form.medicines];
    meds[index] = { ...meds[index], [field]: value };
    setForm({ ...form, medicines: meds });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage(res.ok ? "Prescription added successfully" : data.error);
  }

  return (
    <DashboardLayout role="doctor" userName={userName}>
      <Card title="Add Prescription">
        <p className="mb-4 text-sm text-gray-500">Prescriptions cannot be edited after creation.</p>
        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          <Input
            label="Patient ID"
            value={form.patient_id}
            onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
            required
          />
          {form.medicines.map((med, i) => (
            <div key={i} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
              <Input placeholder="Medicine" value={med.name} onChange={(e) => updateMedicine(i, "name", e.target.value)} />
              <Input placeholder="Dosage" value={med.dosage} onChange={(e) => updateMedicine(i, "dosage", e.target.value)} />
              <Input placeholder="Frequency" value={med.frequency} onChange={(e) => updateMedicine(i, "frequency", e.target.value)} />
              <Input placeholder="Duration" value={med.duration} onChange={(e) => updateMedicine(i, "duration", e.target.value)} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addMedicine}>+ Add Medicine</Button>
          <Input
            label="Instructions"
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          />
          {message && <p className="text-sm text-green-600">{message}</p>}
          <Button type="submit">Save Prescription</Button>
        </form>
      </Card>
    </DashboardLayout>
  );
}
