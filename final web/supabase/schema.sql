-- Doctor Hub Database Schema for Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'assistant', 'admin', 'super_admin');
CREATE TYPE treatment_type AS ENUM ('allopathic', 'homeopathic', 'herbal');
CREATE TYPE appointment_status AS ENUM ('pending', 'payment_uploaded', 'verified', 'confirmed', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected');

-- Users table (extends auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'patient',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender TEXT,
  blood_group TEXT,
  address TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctors
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  treatment_type treatment_type NOT NULL DEFAULT 'allopathic',
  diseases TEXT[] DEFAULT '{}',
  qualification TEXT,
  experience_years INTEGER DEFAULT 0,
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  bio TEXT,
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assistants
CREATE TABLE IF NOT EXISTS assistants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  assigned_clinic_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clinics
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctor schedules
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status appointment_status DEFAULT 'pending',
  symptoms TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  screenshot_url TEXT,
  status payment_status DEFAULT 'pending',
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical History (immutable - no delete)
CREATE TABLE IF NOT EXISTS medical_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  diagnosis TEXT NOT NULL,
  symptoms TEXT,
  notes TEXT,
  report_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions (immutable - no edit)
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  medicines JSONB NOT NULL DEFAULT '[]',
  instructions TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages (patient-doctor communication)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_doctors_treatment ON doctors(treatment_type);
CREATE INDEX idx_doctors_diseases ON doctors USING GIN(diseases);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_medical_history_patient ON medical_history(patient_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_messages_users ON messages(sender_id, receiver_id);

-- Prevent deletion of medical history
CREATE OR REPLACE FUNCTION prevent_medical_history_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Medical history records cannot be deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_delete_medical_history
  BEFORE DELETE ON medical_history
  FOR EACH ROW EXECUTE FUNCTION prevent_medical_history_delete();

-- Prevent deletion of prescriptions
CREATE OR REPLACE FUNCTION prevent_prescription_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Prescription records cannot be deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_delete_prescriptions
  BEFORE DELETE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION prevent_prescription_delete();

-- Prevent prescription updates
CREATE OR REPLACE FUNCTION prevent_prescription_update()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Prescription records cannot be edited';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_update_prescriptions
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION prevent_prescription_update();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;

-- Public read for doctors (for search)
CREATE POLICY "Doctors are viewable by everyone" ON doctors FOR SELECT USING (true);
CREATE POLICY "Clinics are viewable by everyone" ON clinics FOR SELECT USING (true);
CREATE POLICY "Schedules are viewable by everyone" ON schedules FOR SELECT USING (true);

-- Service role bypasses RLS - API uses service role key for backend operations

-- Sample seed data (optional - run after creating users via API)
-- INSERT INTO users (email, password_hash, full_name, role) VALUES ...
