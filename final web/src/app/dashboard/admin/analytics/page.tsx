"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Users, Stethoscope, Calendar, CreditCard } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  pendingPayments: number;
  confirmedAppointments: number;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUserName(d.user?.fullName || ""));
    fetch("/api/analytics").then((r) => r.json()).then((d) => setStats(d.stats));
  }, []);

  const cards = stats
    ? [
        { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary-600" },
        { label: "Doctors", value: stats.totalDoctors, icon: Stethoscope, color: "text-teal-600" },
        { label: "Patients", value: stats.totalPatients, icon: Users, color: "text-amber-600" },
        { label: "Appointments", value: stats.totalAppointments, icon: Calendar, color: "text-purple-600" },
        { label: "Pending Payments", value: stats.pendingPayments, icon: CreditCard, color: "text-red-600" },
        { label: "Confirmed", value: stats.confirmedAppointments, icon: Calendar, color: "text-green-600" },
      ]
    : [];

  return (
    <DashboardLayout role="admin" userName={userName}>
      <h2 className="mb-6 text-2xl font-bold">Analytics & Reports</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <Icon className={`h-8 w-8 ${card.color}`} />
              <p className="mt-3 text-3xl font-bold">{card.value}</p>
              <p className="text-sm text-gray-600">{card.label}</p>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
