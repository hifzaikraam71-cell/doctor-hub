import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { UserRole, TreatmentType } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "local-db.json");

export interface LocalUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface LocalPatient {
  id: string;
  user_id: string;
}

export interface LocalDoctor {
  id: string;
  user_id: string;
  specialization: string;
  treatment_type: TreatmentType;
  diseases: string[];
  consultation_fee: number;
  is_verified: boolean;
  rating: number;
}

export interface LocalAssistant {
  id: string;
  user_id: string;
}

interface LocalDb {
  users: LocalUser[];
  patients: LocalPatient[];
  doctors: LocalDoctor[];
  assistants: LocalAssistant[];
}

async function ensureDb(): Promise<LocalDb> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    const raw = await fs.readFile(DB_FILE, "utf-8");
    return JSON.parse(raw) as LocalDb;
  } catch {
    const empty: LocalDb = { users: [], patients: [], doctors: [], assistants: [] };
    await fs.writeFile(DB_FILE, JSON.stringify(empty, null, 2));
    return empty;
  }
}

async function saveDb(db: LocalDb) {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

export async function findUserByEmail(email: string): Promise<LocalUser | null> {
  const db = await ensureDb();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserById(id: string): Promise<LocalUser | null> {
  const db = await ensureDb();
  return db.users.find((u) => u.id === id) || null;
}

export async function createLocalUser(data: {
  email: string;
  password_hash: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  specialization?: string;
  treatment_type?: TreatmentType;
}): Promise<LocalUser> {
  const db = await ensureDb();

  if (db.users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error("Email already registered");
  }

  const user: LocalUser = {
    id: randomUUID(),
    email: data.email.toLowerCase(),
    password_hash: data.password_hash,
    full_name: data.full_name,
    phone: data.phone,
    role: data.role,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  db.users.push(user);

  if (data.role === "patient") {
    db.patients.push({ id: randomUUID(), user_id: user.id });
  } else if (data.role === "doctor") {
    db.doctors.push({
      id: randomUUID(),
      user_id: user.id,
      specialization: data.specialization || "General Physician",
      treatment_type: data.treatment_type || "allopathic",
      diseases: [],
      consultation_fee: 1500,
      is_verified: true,
      rating: 4.5,
    });
  } else if (data.role === "assistant") {
    db.assistants.push({ id: randomUUID(), user_id: user.id });
  }

  await saveDb(db);
  return user;
}

export async function getLocalDoctors(filters?: {
  disease?: string;
  treatment_type?: string;
  specialization?: string;
}) {
  const db = await ensureDb();
  let doctors = db.doctors.filter((d) => d.is_verified);

  if (filters?.treatment_type) {
    doctors = doctors.filter((d) => d.treatment_type === filters.treatment_type);
  }
  if (filters?.specialization) {
    const q = filters.specialization.toLowerCase();
    doctors = doctors.filter((d) => d.specialization.toLowerCase().includes(q));
  }
  if (filters?.disease) {
    const q = filters.disease.toLowerCase();
    doctors = doctors.filter((d) => d.diseases.some((dis) => dis.toLowerCase().includes(q)));
  }

  return doctors.map((d) => {
    const user = db.users.find((u) => u.id === d.user_id);
    return {
      ...d,
      users: user
        ? { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone }
        : null,
      clinics: [],
    };
  });
}

export async function getAllLocalUsers() {
  const db = await ensureDb();
  return db.users.map(({ password_hash: _, ...user }) => user);
}

export async function updateLocalUser(userId: string, updates: { is_active?: boolean; is_verified?: boolean }) {
  const db = await ensureDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return;

  if (updates.is_active !== undefined) user.is_active = updates.is_active;

  if (updates.is_verified !== undefined && user.role === "doctor") {
    const doctor = db.doctors.find((d) => d.user_id === userId);
    if (doctor) doctor.is_verified = updates.is_verified;
  }

  await saveDb(db);
}

export async function getLocalStats() {
  const db = await ensureDb();
  return {
    totalUsers: db.users.length,
    totalDoctors: db.doctors.length,
    totalPatients: db.patients.length,
    totalAppointments: 0,
    pendingPayments: 0,
    confirmedAppointments: 0,
  };
}

export async function getLocalPatientByUserId(userId: string) {
  const db = await ensureDb();
  return db.patients.find((p) => p.user_id === userId) || null;
}

export async function getLocalDoctorByUserId(userId: string) {
  const db = await ensureDb();
  return db.doctors.find((d) => d.user_id === userId) || null;
}
