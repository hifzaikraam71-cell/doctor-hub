"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import type { Payment } from "@/types";

export default function AssistantPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUserName(d.user?.fullName || ""));
    fetchPayments();
  }, []);

  async function fetchPayments() {
    const res = await fetch("/api/payments");
    const data = await res.json();
    setPayments(data.payments || []);
  }

  async function verifyPayment(paymentId: string, action: "verify" | "reject") {
    setLoading(paymentId);
    await fetch("/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_id: paymentId, action }),
    });
    setLoading(null);
    fetchPayments();
  }

  return (
    <DashboardLayout role="assistant" userName={userName}>
      <h2 className="mb-6 text-2xl font-bold">Payment Verification</h2>

      {payments.length === 0 ? (
        <Card><p className="text-gray-500">No pending payments.</p></Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                  <p className="text-sm text-gray-600">
                    Patient: {(payment.appointments as { patients?: { users?: { full_name: string } } })?.patients?.users?.full_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Doctor: {(payment.appointments as { doctors?: { users?: { full_name: string } } })?.doctors?.users?.full_name}
                  </p>
                  {payment.screenshot_url && (
                    <a href={payment.screenshot_url} target="_blank" rel="noopener" className="mt-2 inline-block text-sm text-primary-600 underline">
                      View Screenshot
                    </a>
                  )}
                </div>
                <StatusBadge status={payment.status} />
              </div>

              {payment.status === "pending" && payment.screenshot_url && (
                <div className="mt-4 flex gap-3 border-t pt-4">
                  <Button size="sm" loading={loading === payment.id} onClick={() => verifyPayment(payment.id, "verify")}>
                    Verify
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => verifyPayment(payment.id, "reject")}>
                    Reject
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
