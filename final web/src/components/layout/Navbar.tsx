import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Stethoscope className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold text-gray-900">Doctor Hub</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/doctors">
            <Button variant="ghost">Find Doctors</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Register</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
