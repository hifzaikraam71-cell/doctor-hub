"use client";

import { useState } from "react";
import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ROLE_ROUTES } from "@/lib/auth";
import type { UserRole } from "@/types";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Stethoscope className="h-10 w-10 text-primary-600" />
            <span className="text-2xl font-bold">Doctor Hub</span>
          </Link>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <Link href="/forgot-password" className="text-primary-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
