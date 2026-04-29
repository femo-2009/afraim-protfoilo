# Deployment Guide — Self-host on Vercel/Netlify with your own Supabase

This project was built on Lovable. To run it on your own infrastructure you need:
- A **Supabase** project (free tier is fine) — for database, auth, storage
- A **Vercel** or **Netlify** account — for hosting the website
- A **GitHub** repo (already connected via Lovable → GitHub)

---

## 1. Create a new Supabase project

1. Go to https://supabase.com → New project. Pick a region close to your users.
2. Save the **Project URL** and the **anon public key** (Settings → API). You will need them later.
3. Also copy the **service_role key** — only used locally for the migration script. **Never** put it in the website code.

## 2. Create the database schema

1. In your new Supabase project: **SQL Editor → New query**.
2. Open `SETUP.sql` from this repo, paste the whole file, and click **Run**.
3. **Important**: edit line `IF NEW.email = 'afraimfarag7@gmail.com'` to your own email before running, or change it later.

## 3. Migrate your existing data + images (optional but recommended)

This copies the profile, skills, certificates, projects, and uploaded images from the old Lovable Cloud backend into your new Supabase project.

```bash
# 1. Clone the repo locally
git clone <your-github-repo-url>
cd <repo>
bun install

# 2. Export from OLD backend (Lovable Cloud)
SUPABASE_URL="https://yvcelpnsiactitawkrse.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<old-service-role-key>" \
node scripts/export-data.mjs
# -> creates ./export/ with JSON + image files

# 3. Import into your NEW Supabase project
SUPABASE_URL="https://<new-ref>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<new-service-role-key>" \
OLD_SUPABASE_URL="https://yvcelpnsiactitawkrse.supabase.co" \
node scripts/import-data.mjs
```

Where to find the **old service role key**: in Lovable, open Cloud → Backend → Settings → API. (You can request it from Lovable support if not visible.)

The script:
- Re-uploads every file in the `portfolio` storage bucket.
- Rewrites `image_url` columns to point at the new Supabase URL.
- Skips `user_roles` — roles are tied to auth users, which differ in the new project. Just sign up with your admin email; the trigger grants you admin automatically.

## 4. Configure auth

In your new Supabase project → **Authentication → URL Configuration**:
- **Site URL**: `https://your-domain.com` (or the Vercel/Netlify URL)
- **Redirect URLs**: add `http://localhost:5173` and your production URL.

If you want Google sign-in: **Authentication → Providers → Google** → enable and add your OAuth credentials.

## 5. Update the project's environment variables

This project currently reads Supabase credentials from `.env`. **Delete or replace** `.env` with these values from your NEW Supabase project:

```env
VITE_SUPABASE_URL="https://<new-ref>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<new-anon-key>"
VITE_SUPABASE_PROJECT_ID="<new-ref>"
SUPABASE_URL="https://<new-ref>.supabase.co"
SUPABASE_PUBLISHABLE_KEY="<new-anon-key>"
```

> The anon key is safe to ship in the frontend. The service_role key must NEVER be put in `.env` of a deployed site.

## 6. Deploy to Vercel

1. Push your repo to GitHub (Lovable already does this for you).
2. Go to https://vercel.com → **Add New → Project** → import your GitHub repo.
3. **Framework Preset**: `Other`.
4. **Build Command**: `bun run build`  (or `npm run build`)
5. **Output Directory**: leave default — TanStack Start handles it.
6. Add environment variables (Settings → Environment Variables):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
7. Click **Deploy**.

> **Note about the runtime**: this project is currently configured for the Cloudflare Workers runtime via `@cloudflare/vite-plugin` and `wrangler.jsonc`. Vercel deploys it fine as a static + serverless build, but if you hit runtime errors specific to the Workers adapter, the simplest fix is to deploy to **Cloudflare Pages** instead (it natively supports the existing config) — see step 7.

## 7. Alternative: Deploy to Cloudflare Pages (zero-config)

Because the project already targets Cloudflare Workers, this is the smoothest path:

1. https://dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick your repo. Build command: `bun run build`. Output: `.output/public`.
3. Add the same env variables as in step 6.
4. Deploy.

## 8. Alternative: Deploy to Netlify

1. https://app.netlify.com → **Add new site → Import from Git**.
2. Netlify auto-reads `netlify.toml` already in this repo.
3. Add the env variables (Site settings → Environment variables).
4. Deploy.

## 9. After deploying — claim admin

1. Open your live site, click the small lock icon in the footer → log in.
2. Sign up with the email you set in `SETUP.sql` (`handle_new_user` function).
3. You're now admin and can edit the profile, skills, certificates, and projects.

---

## Troubleshooting

- **Images don't appear**: open one in a new tab. If the URL still points to `yvcelpnsiactitawkrse.supabase.co`, re-run the import script with `OLD_SUPABASE_URL` set so URLs get rewritten.
- **Login works but "Add" buttons don't appear**: the `handle_new_user` trigger only grants admin if the email matches. Edit it in SQL Editor or insert manually:
  ```sql
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com';
  ```
- **CORS / auth redirect errors**: check Site URL and Redirect URLs in Supabase Authentication settings.
