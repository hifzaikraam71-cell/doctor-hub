"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Stethoscope,
  LayoutDashboard,
  Calendar,
  FileText,
  CreditCard,
  Users,
  MessageSquare,
  Building2,
  Clock,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

const navItems: Record<UserRole, { href: string; label: string; icon: React.ElementType }[]> = {
  patient: [
    { href: "/dashboard/patient", label: "Dashboard", icon: LayoutDashboard },
    { href: "/doctors", label: "Find Doctors", icon: Stethoscope },
    { href: "/dashboard/patient/appointments", label: "Appointments", icon: Calendar },
    { href: "/dashboard/patient/history", label: "Medical History", icon: FileText },
    { href: "/dashboard/patient/prescriptions", label: "Prescriptions", icon: FileText },
    { href: "/dashboard/patient/messages", label: "Messages", icon: MessageSquare },
  ],
  doctor: [
    { href: "/dashboard/doctor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/doctor/appointments", label: "Appointments", icon: Calendar },
    { href: "/dashboard/doctor/prescriptions", label: "Prescriptions", icon: FileText },
    { href: "/dashboard/doctor/history", label: "Medical History", icon: FileText },
    { href: "/dashboard/doctor/clinics", label: "Clinics", icon: Building2 },
    { href: "/dashboard/doctor/schedule", label: "Schedule", icon: Clock },
    { href: "/dashboard/doctor/messages", label: "Messages", icon: MessageSquare },
  ],
  assistant: [
    { href: "/dashboard/assistant", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/assistant/payments", label: "Verify Payments", icon: CreditCard },
    { href: "/dashboard/assistant/appointments", label: "Appointments", icon: Calendar },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
    { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
  ],
  super_admin: [
    { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
    { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
  ],
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  userName: string;
}

export function DashboardLayout({ children, role, userName }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const items = navItems[role];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-gray-200 transition-transform lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Stethoscope className="h-7 w-7 text-primary-600" />
          <span className="text-lg font-bold text-gray-900">Doctor Hub</span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <p className="mb-2 truncate px-3 text-sm font-medium text-gray-900">{userName}</p>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center border-b bg-white px-4 lg:px-8">
          <button className="mr-4 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 capitalize">
            {role.replace("_", " ")} Portal
          </h1>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
