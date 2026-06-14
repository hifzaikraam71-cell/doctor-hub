import { Suspense } from "react";
import BookAppointmentContent from "./BookContent";

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <BookAppointmentContent />
    </Suspense>
  );
}
