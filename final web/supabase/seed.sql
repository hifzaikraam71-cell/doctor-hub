-- Seed data for Doctor Hub (run AFTER schema.sql)
-- Password for all users: password123

INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@doctorhub.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYnK5qK5qK5q', 'Admin User', '03001234567', 'admin'),
  ('a0000000-0000-0000-0000-000000000002', 'doctor1@doctorhub.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYnK5qK5qK5q', 'Dr. Ahmed Khan', '03001234568', 'doctor'),
  ('a0000000-0000-0000-0000-000000000003', 'doctor2@doctorhub.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYnK5qK5qK5q', 'Dr. Sara Ali', '03001234569', 'doctor'),
  ('a0000000-0000-0000-0000-000000000004', 'patient1@doctorhub.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYnK5qK5qK5q', 'Ali Hassan', '03001234570', 'patient'),
  ('a0000000-0000-0000-0000-000000000005', 'assistant@doctorhub.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYnK5qK5qK5q', 'Fatima Assistant', '03001234571', 'assistant')
ON CONFLICT (email) DO NOTHING;

-- Note: Generate real bcrypt hash by registering via the app, or use this script in Node:
-- const bcrypt = require('bcryptjs'); bcrypt.hash('password123', 12).then(console.log)

INSERT INTO doctors (user_id, specialization, treatment_type, diseases, qualification, experience_years, consultation_fee, is_verified, rating) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'Cardiologist', 'allopathic', ARRAY['Heart Disease', 'Hypertension', 'Diabetes'], 'MBBS, FCPS', 15, 2500, true, 4.8),
  ('a0000000-0000-0000-0000-000000000003', 'Homeopathic Physician', 'homeopathic', ARRAY['Allergies', 'Skin Problems', 'Migraine'], 'BHMS', 10, 1500, true, 4.5)
ON CONFLICT DO NOTHING;

INSERT INTO patients (user_id, gender, blood_group, address) VALUES
  ('a0000000-0000-0000-0000-000000000004', 'Male', 'B+', 'Lahore, Pakistan')
ON CONFLICT DO NOTHING;

INSERT INTO assistants (user_id) VALUES
  ('a0000000-0000-0000-0000-000000000005')
ON CONFLICT DO NOTHING;

-- Add clinics (get doctor ids first)
INSERT INTO clinics (doctor_id, name, address, city, phone)
SELECT d.id, 'City Heart Clinic', 'Main Boulevard, Gulberg', 'Lahore', '042-1234567'
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'doctor1@doctorhub.com'
ON CONFLICT DO NOTHING;

INSERT INTO clinics (doctor_id, name, address, city, phone)
SELECT d.id, 'Natural Healing Center', 'Model Town', 'Lahore', '042-7654321'
FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = 'doctor2@doctorhub.com'
ON CONFLICT DO NOTHING;
