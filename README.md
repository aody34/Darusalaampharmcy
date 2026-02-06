# Darusalaampharmcy 🏥 (Production 2.0)

A professional, cloud-connected Pharmacy Management System built for real-world usage.

**Features:**
- **Cloud Database (Supabase)**: Real-time data sync across all devices.
- **Secure Authentication**: Admin & Staff login with role-based access.
- **Advanced POS**: Sell inventory items + custom items (e.g. services).
- **Offline Capable**: (Coming soon)
- **Settings & Management**: Manage pharmacy profile and view team.

---

## 🚀 Setup Guide

### 1. Prerequisites
- Node.js installed.
- A free account at [Supabase](https://supabase.com).

### 2. Configure Database
1.  Create a new project in Supabase.
2.  Go to the **SQL Editor** in the Supabase Dashboard.
3.  Copy the content of `supabase_schema.sql` (found in the project root or provided by developer) and run it.
4.  This creates the tables (`medicines`, `sales`, etc.) and sets up security policies.

### 3. Connect App
1.  Rename `.env.local.example` to `.env.local` (if not already done).
2.  Add your Supabase credentials:
    ```
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key
    ```

### 4. Create First Admin
1.  Go to **Authentication** -> **Users** in Supabase Dashboard.
2.  Click "Add User" -> Create one (e.g., `admin@darusalaam.com`).
3.  **Important**: Go to the `profiles` table in Supabase (Table Editor).
4.  Find the row for this user and change the `role` from `staff` to `admin`.

### 5. Run the App
```bash
npm install
npm run dev
```

---

## 🛡️ Security Roles
- **Admin**: Full access. Can view Reports, Settings, and Manage Inventory.
- **Staff**: POS access only. Can view inventory but not delete medicines. Cannot see Reports.

---

## 🛠️ Tech Stack
- **Frontend**: React + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Deployment recommendation**: Vercel or Netlify.
