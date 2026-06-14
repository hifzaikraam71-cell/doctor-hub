import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Users, BarChart3 } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) redirect("/login");

  return (
    <DashboardLayout role={session.role} userName={session.fullName}>
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <p className="mt-1 text-gray-600">Manage users, doctors, and system analytics</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Card>
          <Users className="h-8 w-8 text-primary-600" />
          <h3 className="mt-3 font-semibold">Manage Users</h3>
          <Link href="/dashboard/admin/users" className="mt-4 inline-block">
            <Button size="sm">View Users</Button>
          </Link>
        </Card>
        <Card>
          <BarChart3 className="h-8 w-8 text-teal-600" />
          <h3 className="mt-3 font-semibold">Analytics</h3>
          <Link href="/dashboard/admin/analytics" className="mt-4 inline-block">
            <Button size="sm" variant="secondary">View Reports</Button>
          </Link>
        </Card>
      </div>
    </DashboardLayout>
  );
}
