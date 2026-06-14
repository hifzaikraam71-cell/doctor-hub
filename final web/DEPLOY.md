# Doctor Hub - Live Deploy Guide (GitHub + Vercel)

Frontend aur backend **ek hi project** mein hain (Next.js). Vercel par deploy karne se dono live ho jate hain.

---

## Step 1: Supabase Setup (Zaroori for Live)

Live site par local file database kaam **nahi** karegi. Supabase chahiye.

1. [supabase.com](https://supabase.com) → **New Project**
2. **SQL Editor** → `supabase/schema.sql` ka poora code paste karke **Run**
3. **Settings → API** se copy karo:
   - Project URL
   - `anon` public key
   - `service_role` secret key

---

## Step 2: GitHub Upload

Terminal mein:

```powershell
cd "c:\Users\MCS\Desktop\web doctor project"

git init
git add .
git commit -m "Doctor Hub - healthcare platform with Supabase"

# GitHub par naya repo banao: github.com/new (name: doctor-hub)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/doctor-hub.git
git push -u origin main
```

---

## Step 3: Vercel Live Link

1. [vercel.com](https://vercel.com) → Sign up (GitHub se login)
2. **Add New Project** → apna `doctor-hub` repo select karo
3. **Environment Variables** add karo:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
| `JWT_SECRET` | koi bhi 32+ character random string |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` (deploy ke baad update) |

4. **Deploy** click karo

**Live link milega:** `https://doctor-hub-xxxx.vercel.app`

---

## Step 4: CLI se Deploy (Optional)

```powershell
cd "c:\Users\MCS\Desktop\web doctor project"
npx vercel login
npx vercel --prod
```

Deploy ke baad `.env` variables Vercel dashboard se set karo.

---

## Project Structure

```
Frontend  → src/app/*.tsx (pages, UI)
Backend   → src/app/api/* (REST APIs)
Database  → Supabase (PostgreSQL)
Auth      → JWT + bcrypt
```

---

## Test Live Site

1. `/register` → Patient account banao
2. `/login` → login karo
3. Doctor register karo → Admin se verify (`role=admin` user se)
4. `/doctors` → doctors search

---

## Demo Accounts (after Supabase + register)

Apne accounts register page se banao. Admin ke liye register karte waqt role `admin` select karo ya Supabase `users` table mein role change karo.
