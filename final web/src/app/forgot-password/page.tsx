"use client";

import { useState } from "react";
import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (data.resetUrl) setResetUrl(data.resetUrl);
    } catch {
      setMessage("Something went wrong");
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
          <p className="mt-2 text-gray-600">Reset your password</p>
        </div>

        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" loading={loading}>
              Send Reset Link
            </Button>
          </form>

          {message && (
            <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {message}
              {resetUrl && (
                <p className="mt-2 break-all">
                  <Link href={resetUrl.replace(process.env.NEXT_PUBLIC_APP_URL || "", "")} className="text-primary-600 underline">
                    Click here to reset
                  </Link>
                </p>
              )}
            </div>
          )}

          <p className="mt-6 text-center text-sm">
            <Link href="/login" className="text-primary-600 hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
