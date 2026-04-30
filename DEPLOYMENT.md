# Deployment Guide

⚠️ **Important — read this first**

This project is a **TanStack Start** app built for the **Cloudflare Workers** runtime
(see `wrangler.jsonc` and `@cloudflare/vite-plugin` in `package.json`).

That means:
- There is **no `index.html`** in the build output. Do not look for one.
- The build produces:
  - `.output/server/` → the server entry (a Worker)
  - `.output/public/` → static assets (JS/CSS/images)
- Pages are rendered **server-side** by the Worker on every request.

This is why a default static deploy on Vercel returns 404 — Vercel looks for
`index.html` and there isn't one.

## ✅ Recommended host: Cloudflare Pages (zero-config)

This is the **only host** that runs the project as-is without any code changes.

1. Go to https://dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git**.
2. Select your GitHub repo.
3. Build settings:
   - **Build command**: `bun run build`
   - **Build output directory**: `.output/public`
4. Add environment variables (Settings → Environment variables → Production):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
5. Click **Save and Deploy**.

Cloudflare reads `wrangler.jsonc` automatically and runs the Worker entry. Done.

---

## ⚠️ Vercel — requires switching the runtime

To deploy on Vercel you must convert the project from the Cloudflare Workers
runtime to Vercel's Node runtime. Steps:

1. Remove `@cloudflare/vite-plugin` and `wrangler.jsonc`.
2. Install the TanStack Start Node/Vercel adapter (`@tanstack/react-start` ships
   with one — see https://tanstack.com/start/latest/docs/framework/react/hosting).
3. Update `vite.config.ts` to use `target: "vercel"`.
4. Re-deploy.

This is a non-trivial migration. **Use Cloudflare Pages instead** unless you
have a hard requirement to be on Vercel.

The `vercel.json` in the repo is configured for the static-fallback case but
will only return a working site if you switch the runtime first.

---

## ⚠️ Netlify — also requires the Netlify adapter

Same situation as Vercel. Netlify will deploy the static assets in
`.output/public/`, but server routes (`/api/*`, server functions, SSR pages)
will 404 unless you install the TanStack Start Netlify adapter and reconfigure
`vite.config.ts`.

---

## Setting up your own Supabase backend

(Same as before — these steps apply regardless of which host you pick.)

### 1. Create a new Supabase project

1. https://supabase.com → New project. Save the **Project URL**, **anon key**,
   and **service_role key**.
2. **Service_role key is server-only** — never put it in frontend env or commit it.

### 2. Create the database schema

1. SQL Editor → New query.
2. Paste `SETUP.sql` from this repo and run it.
3. Edit the line `IF NEW.email = 'afraimfarag7@gmail.com'` to your own email
   first (or update it later).

### 3. Migrate data + images (optional)

```bash
git clone <your-github-repo-url>
cd <repo>
bun install

# Export from old backend
SUPABASE_URL="https://yvcelpnsiactitawkrse.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<old-service-role-key>" \
node scripts/export-data.mjs

# Import into new project
SUPABASE_URL="https://<new-ref>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<new-service-role-key>" \
OLD_SUPABASE_URL="https://yvcelpnsiactitawkrse.supabase.co" \
node scripts/import-data.mjs
```

### 4. Configure auth

Supabase → **Authentication → URL Configuration**:
- **Site URL**: your production URL
- **Redirect URLs**: add `http://localhost:5173` and your production URL

### 5. Environment variables

Set these on your host (Cloudflare Pages / Vercel / Netlify):

```
VITE_SUPABASE_URL=https://<new-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<new-anon-key>
VITE_SUPABASE_PROJECT_ID=<new-ref>
SUPABASE_URL=https://<new-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<new-anon-key>
```

### 6. Claim admin

After deploy, open the site → footer lock icon → sign up with the admin email
you set in `SETUP.sql`. The `handle_new_user` trigger grants admin automatically.

---

## Troubleshooting

- **404 on Vercel / "missing index.html"**: expected — see the warning at the
  top. Use Cloudflare Pages or migrate to the Vercel adapter.
- **Images don't appear after migration**: re-run `import-data.mjs` with
  `OLD_SUPABASE_URL` set so URLs get rewritten.
- **Login works but Add/Edit/Delete buttons don't appear**: admin role wasn't
  granted. Run in SQL Editor:
  ```sql
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com';
  ```
- **Auth redirect errors**: check Site URL + Redirect URLs in Supabase.

---

## About pushing to GitHub

Lovable already syncs every change in this editor to your connected GitHub
repo automatically. There's no separate push step — once the files above are
updated here, your repo has them. Just trigger a redeploy on your host.
