import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Calendar, FileText, Stethoscope } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function PatientDashboard() {
  const session = await getSession();
  if (!session || session.role !== "patient") redirect("/login");

  return (
    <DashboardLayout role="patient" userName={session.fullName}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {session.fullName}</h2>
        <p className="mt-1 text-gray-600">Manage your health appointments and records</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <Card>
            <Stethoscope className="h-8 w-8 text-primary-600" />
            <h3 className="mt-3 font-semibold">Find Doctors</h3>
            <p className="mt-1 text-sm text-gray-600">Search by disease and treatment type</p>
            <Link href="/doctors" className="mt-4 inline-block">
              <Button size="sm">Search Now</Button>
            </Link>
          </Card>
          <Card>
            <Calendar className="h-8 w-8 text-teal-600" />
            <h3 className="mt-3 font-semibold">My Appointments</h3>
            <p className="mt-1 text-sm text-gray-600">View and manage bookings</p>
            <Link href="/dashboard/patient/appointments" className="mt-4 inline-block">
              <Button size="sm" variant="secondary">View All</Button>
            </Link>
          </Card>
          <Card>
            <FileText className="h-8 w-8 text-amber-600" />
            <h3 className="mt-3 font-semibold">Medical History</h3>
            <p className="mt-1 text-sm text-gray-600">View your health records</p>
            <Link href="/dashboard/patient/history" className="mt-4 inline-block">
              <Button size="sm" variant="outline">View Records</Button>
            </Link>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
