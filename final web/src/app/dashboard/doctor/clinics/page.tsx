"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Clinic } from "@/types";

export default function DoctorClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [userName, setUserName] = useState("");
  const [form, setForm] = useState({ name: "", address: "", city: "", phone: "" });

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUserName(d.user?.fullName || ""));
    fetchClinics();
  }, []);

  async function fetchClinics() {
    const res = await fetch("/api/clinics");
    const data = await res.json();
    setClinics(data.clinics || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/clinics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", address: "", city: "", phone: "" });
    fetchClinics();
  }

  return (
    <DashboardLayout role="doctor" userName={userName}>
      <Card title="Add Clinic" className="mb-6">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Button type="submit">Add Clinic</Button>
        </form>
      </Card>

      <div className="space-y-4">
        {clinics.map((c) => (
          <Card key={c.id}>
            <h3 className="font-semibold">{c.name}</h3>
            <p className="text-sm text-gray-600">{c.address}, {c.city}</p>
            {c.phone && <p className="text-sm text-gray-500">{c.phone}</p>}
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
