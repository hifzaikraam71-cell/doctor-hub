"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";

export default function DoctorMessagesPage() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUserName(d.user?.fullName || ""));
  }, []);

  return (
    <DashboardLayout role="doctor" userName={userName}>
      <Card title="Messages">
        <p className="text-gray-500">Patient messages will appear here. Use the Messages API to communicate with patients.</p>
      </Card>
    </DashboardLayout>
  );
}
