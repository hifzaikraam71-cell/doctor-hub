import { cn } from "@/lib/utils";

const variants = {
  default: "bg-gray-100 text-gray-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  primary: "bg-primary-100 text-primary-800",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: keyof typeof variants }> = {
    pending: { label: "Pending", variant: "warning" },
    payment_uploaded: { label: "Payment Uploaded", variant: "info" },
    verified: { label: "Verified", variant: "success" },
    confirmed: { label: "Confirmed", variant: "success" },
    completed: { label: "Completed", variant: "default" },
    cancelled: { label: "Cancelled", variant: "danger" },
    rejected: { label: "Rejected", variant: "danger" },
  };
  const config = map[status] || { label: status, variant: "default" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
