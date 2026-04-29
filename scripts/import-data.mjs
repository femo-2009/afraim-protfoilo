// Import data + storage files into your NEW (own) Supabase project.
// Run AFTER you have executed SETUP.sql on the new project.
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-data.mjs

import { createClient } from "@supabase/supabase-js";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars (from your NEW Supabase project).");
  process.exit(1);
}
const sb = createClient(URL, KEY);
const IN = "./export";

// Optional: if image_url values point to old Supabase URL, rewrite to new one
const OLD_URL = process.env.OLD_SUPABASE_URL; // e.g. https://yvcelpnsiactitawkrse.supabase.co
function rewriteUrls(row) {
  if (!OLD_URL) return row;
  const out = { ...row };
  for (const k of Object.keys(out)) {
    if (typeof out[k] === "string" && out[k].includes(OLD_URL)) {
      out[k] = out[k].replaceAll(OLD_URL, URL);
    }
  }
  return out;
}

async function loadJson(name) {
  try { return JSON.parse(await readFile(join(IN, `${name}.json`), "utf8")); }
  catch { return []; }
}

async function importTable(name, { upsert = true } = {}) {
  const rows = (await loadJson(name)).map(rewriteUrls);
  if (rows.length === 0) { console.log(`- ${name}: empty`); return; }
  // Profile already has a default row from SETUP.sql; clear it first.
  if (name === "profile") {
    await sb.from("profile").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  }
  const { error } = upsert
    ? await sb.from(name).upsert(rows)
    : await sb.from(name).insert(rows);
  if (error) console.error(`✗ ${name}: ${error.message}`);
  else console.log(`✓ ${name}: ${rows.length} rows`);
}

async function* walk(dir) {
  for (const e of await readdir(dir)) {
    const p = join(dir, e);
    const s = await stat(p);
    if (s.isDirectory()) yield* walk(p); else yield p;
  }
}

async function importStorage(bucket) {
  const root = join(IN, "storage", bucket);
  try { await stat(root); } catch { console.log(`- storage/${bucket}: nothing to import`); return; }
  for await (const file of walk(root)) {
    const path = relative(root, file).split("\\").join("/");
    const buf = await readFile(file);
    const { error } = await sb.storage.from(bucket).upload(path, buf, { upsert: true });
    if (error) console.warn(`  ! ${path}: ${error.message}`);
    else console.log(`  ✓ ${path}`);
  }
}

await importTable("profile");
await importTable("skills");
await importTable("certificates");
await importTable("projects");
// Skip user_roles: roles are tied to auth.users IDs which differ in the new project.
// Sign up with your admin email after import — the trigger will grant the admin role automatically.
await importStorage("portfolio");
console.log("\nDone.");
