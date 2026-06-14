import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import {
  Stethoscope,
  Calendar,
  Shield,
  FileText,
  CreditCard,
  Users,
  Search,
  Heart,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Doctor Search",
    description: "Find doctors by disease, specialization, and treatment type.",
  },
  {
    icon: Calendar,
    title: "Appointment Booking",
    description: "Book appointments online with your preferred doctor and time slot.",
  },
  {
    icon: FileText,
    title: "Medical History",
    description: "Secure, immutable medical records shared between patient and doctor.",
  },
  {
    icon: CreditCard,
    title: "Payment Verification",
    description: "Upload payment proof and get verified by doctor assistants.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "JWT authentication, encrypted passwords, and role-based access control.",
  },
  {
    icon: Users,
    title: "Multi-Role System",
    description: "Patient, Doctor, Assistant, Admin, and Super Admin roles.",
  },
];

const treatments = [
  { name: "Allopathic", color: "bg-blue-100 text-blue-700" },
  { name: "Homeopathic", color: "bg-green-100 text-green-700" },
  { name: "Herbal", color: "bg-amber-100 text-amber-700" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-teal-600 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur">
              <Heart className="h-4 w-4" />
              Healthcare Consultation Platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Your Health, Our Priority
            </h1>
            <p className="mt-6 text-lg text-primary-100">
              Doctor Hub connects patients with Allopathic, Homeopathic, and Herbal doctors.
              Book appointments, manage medical history, and get prescriptions — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/doctors">
                <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
                  <Search className="mr-2 h-5 w-5" />
                  Find a Doctor
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">Treatment Types</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-gray-600">
            Choose from three treatment approaches
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {treatments.map((t) => (
              <div key={t.name} className="rounded-xl border bg-white p-8 text-center shadow-sm">
                <Stethoscope className="mx-auto h-12 w-12 text-primary-600" />
                <h3 className="mt-4 text-xl font-semibold">{t.name}</h3>
                <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${t.color}`}>
                  Available
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">Platform Features</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-xl border bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-primary-600 p-10 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mt-4 text-primary-100">
            Join Doctor Hub today and take control of your healthcare journey.
          </p>
          <Link href="/register" className="mt-6 inline-block">
            <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
              Create Account
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t bg-white px-4 py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Doctor Hub. Final Semester Project.</p>
      </footer>
    </div>
  );
}
