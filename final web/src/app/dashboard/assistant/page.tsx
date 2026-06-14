import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CreditCard, Calendar } from "lucide-react";

export default async function AssistantDashboard() {
  const session = await getSession();
  if (!session || session.role !== "assistant") redirect("/login");

  return (
    <DashboardLayout role="assistant" userName={session.fullName}>
      <h2 className="text-2xl font-bold">Assistant Dashboard</h2>
      <p className="mt-1 text-gray-600">Verify payments and manage bookings</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Card>
          <CreditCard className="h-8 w-8 text-primary-600" />
          <h3 className="mt-3 font-semibold">Verify Payments</h3>
          <p className="text-sm text-gray-600">Review payment screenshots and confirm appointments</p>
          <Link href="/dashboard/assistant/payments" className="mt-4 inline-block">
            <Button size="sm">Go to Payments</Button>
          </Link>
        </Card>
        <Card>
          <Calendar className="h-8 w-8 text-teal-600" />
          <h3 className="mt-3 font-semibold">Appointments</h3>
          <Link href="/dashboard/assistant/appointments" className="mt-4 inline-block">
            <Button size="sm" variant="secondary">View All</Button>
          </Link>
        </Card>
      </div>
    </DashboardLayout>
  );
}
