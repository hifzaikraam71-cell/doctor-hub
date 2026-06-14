"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ROLE_LABELS } from "@/types";
import type { User } from "@/types";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUserName(d.user?.fullName || ""));
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users || []);
  }

  async function toggleActive(userId: string, isActive: boolean) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, is_active: !isActive }),
    });
    fetchUsers();
  }

  async function verifyDoctor(userId: string) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, is_verified: true }),
    });
    fetchUsers();
  }

  return (
    <DashboardLayout role="admin" userName={userName}>
      <h2 className="mb-6 text-2xl font-bold">Manage Users</h2>

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">{user.full_name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="primary">{ROLE_LABELS[user.role]}</Badge>
                  <Badge variant={user.is_active ? "success" : "danger"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-gray-400">Joined {formatDate(user.created_at)}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleActive(user.id, user.is_active)}>
                  {user.is_active ? "Deactivate" : "Activate"}
                </Button>
                {user.role === "doctor" && (
                  <Button size="sm" onClick={() => verifyDoctor(user.id)}>Verify Doctor</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
