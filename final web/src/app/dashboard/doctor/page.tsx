import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Calendar, FileText, Building2, Clock } from "lucide-react";

export default async function DoctorDashboard() {
  const session = await getSession();
  if (!session || session.role !== "doctor") redirect("/login");

  return (
    <DashboardLayout role="doctor" userName={session.fullName}>
      <h2 className="text-2xl font-bold">Doctor Dashboard</h2>
      <p className="mt-1 text-gray-600">Manage appointments, prescriptions, and clinics</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <Calendar className="h-8 w-8 text-primary-600" />
          <h3 className="mt-3 font-semibold">Appointments</h3>
          <Link href="/dashboard/doctor/appointments" className="mt-3 inline-block">
            <Button size="sm">View</Button>
          </Link>
        </Card>
        <Card>
          <FileText className="h-8 w-8 text-teal-600" />
          <h3 className="mt-3 font-semibold">Prescriptions</h3>
          <Link href="/dashboard/doctor/prescriptions" className="mt-3 inline-block">
            <Button size="sm" variant="secondary">Add</Button>
          </Link>
        </Card>
        <Card>
          <Building2 className="h-8 w-8 text-amber-600" />
          <h3 className="mt-3 font-semibold">Clinics</h3>
          <Link href="/dashboard/doctor/clinics" className="mt-3 inline-block">
            <Button size="sm" variant="outline">Manage</Button>
          </Link>
        </Card>
        <Card>
          <Clock className="h-8 w-8 text-purple-600" />
          <h3 className="mt-3 font-semibold">Schedule</h3>
          <Link href="/dashboard/doctor/schedule" className="mt-3 inline-block">
            <Button size="sm" variant="outline">Set Hours</Button>
          </Link>
        </Card>
      </div>
    </DashboardLayout>
  );
}
