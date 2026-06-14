"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TREATMENT_LABELS } from "@/types";
import type { Doctor } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Star, Stethoscope } from "lucide-react";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    disease: "",
    treatment_type: "",
    specialization: "",
    city: "",
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  async function fetchDoctors() {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const res = await fetch(`/api/doctors?${params}`);
    const data = await res.json();
    setDoctors(data.doctors || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Find a Doctor</h1>
        <p className="mt-2 text-gray-600">Search by disease, treatment type, or specialization</p>

        <Card className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Input
              placeholder="Disease (e.g. Diabetes)"
              value={filters.disease}
              onChange={(e) => setFilters({ ...filters, disease: e.target.value })}
            />
            <Select
              value={filters.treatment_type}
              onChange={(e) => setFilters({ ...filters, treatment_type: e.target.value })}
              options={[
                { value: "", label: "All Treatments" },
                { value: "allopathic", label: "Allopathic" },
                { value: "homeopathic", label: "Homeopathic" },
                { value: "herbal", label: "Herbal" },
              ]}
            />
            <Input
              placeholder="Specialization"
              value={filters.specialization}
              onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
            />
            <Input
              placeholder="City"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />
            <Button onClick={fetchDoctors}>Search</Button>
          </div>
        </Card>

        {loading ? (
          <div className="mt-8 text-center text-gray-500">Loading doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="mt-8 text-center text-gray-500">No doctors found. Try different filters.</div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="flex flex-col">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
                    <Stethoscope className="h-7 w-7 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      Dr. {doctor.users?.full_name || "Unknown"}
                    </h3>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="primary">
                        {TREATMENT_LABELS[doctor.treatment_type]}
                      </Badge>
                      {doctor.rating > 0 && (
                        <Badge variant="warning">
                          <Star className="mr-1 inline h-3 w-3" />
                          {doctor.rating}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {doctor.diseases?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {doctor.diseases.map((d) => (
                      <Badge key={d}>{d}</Badge>
                    ))}
                  </div>
                )}

                {doctor.clinics?.[0] && (
                  <p className="mt-3 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    {doctor.clinics[0].name}, {doctor.clinics[0].city}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="font-semibold text-primary-600">
                    {formatCurrency(doctor.consultation_fee)}
                  </span>
                  <Link href={`/dashboard/patient/book?doctor=${doctor.id}`}>
                    <Button size="sm">Book Appointment</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
