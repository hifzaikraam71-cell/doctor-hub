import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(time: string) {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export function formatCurrency(amount: number) {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}
