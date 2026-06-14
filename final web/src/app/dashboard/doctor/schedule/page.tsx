"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { DAYS } from "@/types";
import type { Schedule } from "@/types";

export default function DoctorSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [userName, setUserName] = useState("");
  const [form, setForm] = useState({
    day_of_week: "1",
    start_time: "09:00",
    end_time: "17:00",
    slot_duration: "30",
  });

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUserName(d.user?.fullName || ""));
    fetchSchedules();
  }, []);

  async function fetchSchedules() {
    const res = await fetch("/api/schedules");
    const data = await res.json();
    setSchedules(data.schedules || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        day_of_week: parseInt(form.day_of_week),
        start_time: form.start_time,
        end_time: form.end_time,
        slot_duration: parseInt(form.slot_duration),
      }),
    });
    fetchSchedules();
  }

  return (
    <DashboardLayout role="doctor" userName={userName}>
      <Card title="Add Schedule" className="mb-6">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Day"
            value={form.day_of_week}
            onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
            options={DAYS.map((d, i) => ({ value: String(i), label: d }))}
          />
          <Input label="Start Time" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
          <Input label="End Time" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          <Input label="Slot (min)" type="number" value={form.slot_duration} onChange={(e) => setForm({ ...form, slot_duration: e.target.value })} />
          <Button type="submit">Add</Button>
        </form>
      </Card>

      <div className="space-y-3">
        {schedules.map((s) => (
          <Card key={s.id}>
            <p className="font-medium">{DAYS[s.day_of_week]}</p>
            <p className="text-sm text-gray-600">{s.start_time} - {s.end_time} ({s.slot_duration} min slots)</p>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
