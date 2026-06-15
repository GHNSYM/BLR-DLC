# Supabase Setup — Banglore DLC

Follow these steps to connect the app to a real database so you and your friend can plan together, with photo uploads per activity.

**No Realtime required** — the free tier works fine. The app auto-refreshes from Supabase every 5 seconds.

---

## 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign up / log in.
2. Click **New project**.
3. Pick an organization, name the project (e.g. `banglore-dlc`), set a database password, and choose a region close to India (e.g. **Singapore** or **Mumbai** if available).
4. Wait ~2 minutes for the project to finish provisioning.

---

## 2. Run the database schema

1. In your Supabase dashboard, open **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open `supabase/schema.sql` from this repo, copy the entire file, paste it into the editor.
4. Click **Run** (or press Ctrl+Enter).
5. You should see **Success** — this creates:
   - `trips`, `tracks`, `days`, `activities` tables
   - Row-level security policies (open for anon — fine for a private trip between friends)
   - `activity-images` storage bucket for photos

---

## 3. Get your API keys

1. Go to **Project Settings → API**.
2. Copy:
   - **Project URL** (e.g. `https://abcdefgh.supabase.co`)
   - **anon public** key (under *Project API keys*)

> Never commit the `service_role` key to the frontend — only use the **anon** key in this Vite app.

---

## 4. Configure the app

1. In the project root, copy the example env file:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Edit `.env` and fill in your values:

   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   VITE_TRIP_ID=banglore-dlc-2026
   ```

3. Restart the dev server:

   ```bash
   npm run dev
   ```

4. Open the app — you should see **"Cloud sync on"** in the green banner.

---

## 5. Share with your friend

Both of you use the **same** `.env` values (same Supabase project + same `VITE_TRIP_ID`).

Options:
- Send them the `.env` file privately (Signal / WhatsApp — not git)
- Or deploy to Vercel/Netlify with env vars set in the dashboard

On first load, the app shows an **empty state** — you create trips, chapters, days, and quests from scratch. Everything is stored in Supabase first, then displayed.

> If you previously auto-seeded data, it will still show from your database. Delete old trips via the UI or Supabase Table Editor to start fresh.

---

## How sync works (free tier)

| What | How |
|------|-----|
| Your changes | Saved to Supabase immediately when you check off / add / upload |
| Friend's changes | Appear within **~5 seconds** (auto-poll) |
| Switch back to tab | Refreshes instantly |
| Manual refresh | Click **Sync now** in the green banner |

You do **not** need to enable Realtime or Replication in the Supabase dashboard.

---

## 6. Upload photos

On any activity card:
1. Click **Add photo** (or **Change photo**)
2. Pick JPEG, PNG, WebP, or GIF (max 5 MB recommended)
3. Photo uploads to Supabase Storage and syncs to your friend on the next poll
4. Tap the thumbnail to view full size
5. Click **Remove** to delete the photo

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Offline mode" banner | `.env` missing or dev server not restarted after adding keys |
| RLS / permission errors | Re-run `supabase/schema.sql` in SQL Editor |
| Upload fails | Confirm `activity-images` bucket exists under **Storage** |
| Friend's changes not showing | Click **Sync now**, or wait ~5 seconds |
| Want to start fresh | Use **Reset progress** in the app, or delete rows in Supabase Table Editor |

---

## Optional: Secure with auth later

The current setup uses open anon policies so you can ship fast. To lock it down:

1. Enable **Authentication → Email** in Supabase
2. Replace anon policies with `authenticated` user checks
3. Add a `trip_members` table linking users to `trip_id`

For a two-person trip among friends, the current setup is usually enough.
