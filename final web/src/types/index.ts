export type UserRole = "patient" | "doctor" | "assistant" | "admin" | "super_admin";
export type TreatmentType = "allopathic" | "homeopathic" | "herbal";
export type AppointmentStatus =
  | "pending"
  | "payment_uploaded"
  | "verified"
  | "confirmed"
  | "completed"
  | "cancelled";
export type PaymentStatus = "pending" | "verified" | "rejected";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  treatment_type: TreatmentType;
  diseases: string[];
  qualification?: string;
  experience_years: number;
  consultation_fee: number;
  bio?: string;
  is_verified: boolean;
  rating: number;
  users?: User;
  clinics?: Clinic[];
}

export interface Patient {
  id: string;
  user_id: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  address?: string;
  emergency_contact?: string;
  users?: User;
}

export interface Clinic {
  id: string;
  doctor_id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  is_active: boolean;
}

export interface Schedule {
  id: string;
  doctor_id: string;
  clinic_id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
  is_active: boolean;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  clinic_id?: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  symptoms?: string;
  notes?: string;
  created_at: string;
  doctors?: Doctor;
  patients?: Patient;
  clinics?: Clinic;
  payments?: Payment;
}

export interface Payment {
  id: string;
  appointment_id: string;
  amount: number;
  screenshot_url?: string;
  status: PaymentStatus;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  created_at: string;
  appointments?: Appointment;
}

export interface MedicalHistory {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  diagnosis: string;
  symptoms?: string;
  notes?: string;
  report_url?: string;
  created_at: string;
  doctors?: Doctor;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  medicines: Medicine[];
  instructions?: string;
  follow_up_date?: string;
  created_at: string;
  doctors?: Doctor;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  appointment_id?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  patient: "Patient",
  doctor: "Doctor",
  assistant: "Assistant",
  admin: "Admin",
  super_admin: "Super Admin",
};

export const TREATMENT_LABELS: Record<TreatmentType, string> = {
  allopathic: "Allopathic",
  homeopathic: "Homeopathic",
  herbal: "Herbal",
};

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
