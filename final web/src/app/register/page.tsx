"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ROLE_ROUTES } from "@/lib/auth";
import type { UserRole } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role: "patient",
    specialization: "",
    treatment_type: "allopathic",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      window.location.href = ROLE_ROUTES[data.user.role as UserRole];
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Stethoscope className="h-10 w-10 text-primary-600" />
            <span className="text-2xl font-bold">Doctor Hub</span>
          </Link>
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>

        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="full_name"
              label="Full Name"
              value={form.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              required
            />
            <Input
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              minLength={6}
              required
            />
            <Input
              id="phone"
              label="Phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
            <Select
              id="role"
              label="Register As"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              options={[
                { value: "patient", label: "Patient" },
                { value: "doctor", label: "Doctor" },
                { value: "assistant", label: "Assistant" },
              ]}
            />

            {form.role === "doctor" && (
              <>
                <Input
                  id="specialization"
                  label="Specialization"
                  value={form.specialization}
                  onChange={(e) => update("specialization", e.target.value)}
                  placeholder="e.g. Cardiologist"
                />
                <Select
                  id="treatment_type"
                  label="Treatment Type"
                  value={form.treatment_type}
                  onChange={(e) => update("treatment_type", e.target.value)}
                  options={[
                    { value: "allopathic", label: "Allopathic" },
                    { value: "homeopathic", label: "Homeopathic" },
                    { value: "herbal", label: "Herbal" },
                  ]}
                />
              </>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
