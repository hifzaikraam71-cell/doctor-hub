# Doctor Hub - Healthcare Consultation Platform

A full-stack healthcare consultation and patient history management system built with **Next.js 15**, **Supabase**, and **Tailwind CSS**.

## Features

- Doctor search by disease, specialization, and treatment type (Allopathic, Homeopathic, Herbal)
- Appointment booking with payment verification workflow
- Immutable medical history and prescriptions
- Role-based access control (Patient, Doctor, Assistant, Admin, Super Admin)
- JWT authentication with encrypted passwords
- Clinic and schedule management
- Patient-doctor messaging
- Admin analytics dashboard

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS 4 |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Auth | JWT + bcrypt |
| Deployment | Vercel |

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Open **SQL Editor** and run `supabase/schema.sql`
3. Go to **Settings → API** and copy your keys

### 3. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-random-32-char-secret-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Create Test Accounts

Register via the app at `/register` with different roles:
- **Patient** - Book appointments, view history
- **Doctor** - Manage clinics, prescriptions
- **Assistant** - Verify payments

For Admin, register with role `admin` or insert directly in Supabase.

## Deploy to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial Doctor Hub project"
git remote add origin https://github.com/YOUR_USERNAME/doctor-hub.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Add Environment Variables (same as `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`
4. Click **Deploy**

### Step 3: Verify Doctors

After doctors register, admin must verify them via **Admin → Manage Users → Verify Doctor** before they appear in search.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/forgot-password` | Password reset request |
| GET | `/api/doctors` | Search doctors (public) |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments` | List appointments |
| POST | `/api/payments` | Upload payment screenshot |
| POST | `/api/payments/verify` | Verify/reject payment |
| GET | `/api/history` | Get medical history |
| POST | `/api/history` | Add medical history (doctor) |
| GET | `/api/prescriptions` | Get prescriptions |
| POST | `/api/prescriptions` | Add prescription (doctor) |
| GET | `/api/analytics` | Dashboard analytics |

## Appointment Workflow

1. Patient searches doctor by disease/treatment
2. Patient books appointment
3. Patient uploads payment screenshot
4. Assistant verifies payment
5. Appointment confirmed
6. Doctor adds medical history & prescription

## Medical History Rules

- Records **cannot be deleted**
- Doctors can only **add** new records
- Prescriptions **cannot be edited**
- Patients **cannot remove** doctor prescriptions

## Project Structure

```
src/
├── app/
│   ├── api/          # REST API routes
│   ├── dashboard/    # Role-based dashboards
│   ├── doctors/      # Public doctor search
│   └── login/        # Auth pages
├── components/       # UI components
├── lib/              # Auth, Supabase, utils
└── types/            # TypeScript types
supabase/
├── schema.sql        # Database schema
└── seed.sql          # Sample data
```

## License

Final Semester Project - Educational Use
