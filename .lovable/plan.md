# Afraim Farag — Developer Portfolio

A 4-page portfolio site with a "modern dev portfolio" aesthetic (dark navy background, purple/blue gradients, monospace headings, subtle code-snippet decorations) and a single-admin CMS so you can manage all content from the browser.

## Pages

**1. Home (`/`)**
- Hero: photo of Afraim Farag + bio text
- Auto-scrolling marquee of skill cards (pulled live from the Skills page)
- Auto-scrolling marquee of certificate cards (pulled live from the Certificates page)
- Both marquees pause on hover and update instantly when you add/edit/delete in admin

**2. Skills (`/skills`)**
- Grid of skill cards (photo + title)
- Click a card → expands into a larger modal with full details
- Admin can add / edit / delete skills (each with image upload, title, description)

**3. Certificates (`/certificates`)**
- Same pattern as Skills: grid of cards (photo + title), click to expand modal with details
- Admin can add / edit / delete certificates

**4. Projects (`/projects`)**
- Grid of project cards (photo + title)
- Click to expand: shows description plus buttons for **Live website** and **Code repository**
- Admin can add / edit / delete projects (image, title, description, website URL, code URL)

## Admin Experience

- Login at `/admin/login` with your email (`afraimfarag7@gmail.com`) and the password you provided
- Only this email is treated as admin — everyone else just browses
- When logged in, an **Admin** bar appears with edit/add/delete controls inline on every page
- Home page admin controls: change Afraim's photo, edit the bio
- Skills/Certificates/Projects: "Add new" button + edit/delete on every card

## Visual Style — Modern Dev Portfolio

- Dark navy background with purple/blue gradient accents
- Monospace font (JetBrains Mono) for headings, code snippets, and labels
- Subtle decorative elements: terminal prompt symbols (`>`, `$`), bracket accents, animated typing effect on the hero name
- Smooth card hover lift, glowing borders on focus
- Responsive on mobile (single column) and desktop (multi-column grids)

## Data & Storage

- **Lovable Cloud** powers everything (database, auth, file storage)
- Tables: `profile` (single row: photo + bio), `skills`, `certificates`, `projects`
- Image uploads stored in cloud storage buckets — public read, admin-only write
- Live updates: when you change content in admin, the home page sliders refresh immediately

## Security

- Your password is **not** stored in the codebase (that would be public). Instead, I'll create your auth account in Lovable Cloud with the credentials you provided. Only logins matching your exact email get admin privileges.
- Database row-level security: anyone can read content, only you can write
- Storage policies: anyone can view images, only you can upload/delete

## Technical Notes

- Routes: `index.tsx`, `skills.tsx`, `certificates.tsx`, `projects.tsx`, `admin.login.tsx`
- Shared header with nav + login/logout button in `__root.tsx`
- Admin detection: `useAdmin()` hook checks the logged-in email against your admin email
- Marquee: continuous CSS animation, duplicated content for seamless loop
- Card expand: `Dialog` from shadcn/ui
- Live updates: TanStack Query with cache invalidation after mutations; Supabase realtime subscription on the home page so other browser tabs update too
