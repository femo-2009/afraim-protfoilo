// Export all data + storage files from your CURRENT (Lovable Cloud) Supabase project.
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/export-data.mjs
//
// Output: ./export/
//   - profile.json, skills.json, certificates.json, projects.json, user_roles.json
//   - storage/portfolio/<all files preserving paths>

import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars (from your OLD Lovable Cloud project).");
  process.exit(1);
}
const sb = createClient(URL, KEY);
const OUT = "./export";

async function dumpTable(name) {
  const { data, error } = await sb.from(name).select("*");
  if (error) throw new Error(`${name}: ${error.message}`);
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, `${name}.json`), JSON.stringify(data, null, 2));
  console.log(`✓ ${name}: ${data.length} rows`);
}

async function listAll(bucket, prefix = "") {
  const out = [];
  let offset = 0;
  while (true) {
    const { data, error } = await sb.storage.from(bucket).list(prefix, { limit: 1000, offset });
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) {
        // folder
        const sub = await listAll(bucket, path);
        out.push(...sub);
      } else {
        out.push(path);
      }
    }
    if (data.length < 1000) break;
    offset += 1000;
  }
  return out;
}

async function dumpStorage(bucket) {
  const files = await listAll(bucket);
  console.log(`Storage bucket "${bucket}": ${files.length} files`);
  for (const path of files) {
    const { data, error } = await sb.storage.from(bucket).download(path);
    if (error) { console.warn(`  ! ${path}: ${error.message}`); continue; }
    const buf = Buffer.from(await data.arrayBuffer());
    const local = join(OUT, "storage", bucket, path);
    await mkdir(dirname(local), { recursive: true });
    await writeFile(local, buf);
    console.log(`  ✓ ${path}`);
  }
}

await dumpTable("profile");
await dumpTable("skills");
await dumpTable("certificates");
await dumpTable("projects");
await dumpTable("user_roles");
await dumpStorage("portfolio");
console.log("\nDone. Files saved in ./export/");
