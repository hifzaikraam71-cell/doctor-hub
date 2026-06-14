"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();

    if (res.ok) {
      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      setError(data.error || "Reset failed");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Stethoscope className="h-10 w-10 text-primary-600" />
            <span className="text-2xl font-bold">Doctor Hub</span>
          </Link>
        </div>

        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            {message && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>}
            <Button type="submit" className="w-full" loading={loading}>
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
