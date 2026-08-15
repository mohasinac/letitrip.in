#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sa = require(resolve(process.cwd(), "firebase-admin-key.json"));
const home = process.env.USERPROFILE ?? process.env.HOME ?? "";
const ftCfg = JSON.parse(readFileSync(resolve(home, ".config/configstore/firebase-tools.json"), "utf8"));

const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: ftCfg.tokens.refresh_token,
    client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
    client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
  }),
});
const { access_token } = await tokenRes.json();

// The `collectionGroups/{collectionId}/indexes` REST endpoint is scoped to a single
// collection group — it does NOT return indexes globally despite the old comment here
// claiming otherwise. Enumerate every collection group actually declared in the
// generated firestore.indexes.json (source of truth for what was just deployed) and
// poll each one, aggregating counts across all of them.
const indexesJson = require(resolve(process.cwd(), "firestore.indexes.json"));
const collectionGroups = [...new Set(indexesJson.indexes.map((i) => i.collectionGroup))];

async function poll() {
  const counts = { READY: 0, CREATING: 0, NEEDS_REPAIR: 0, other: 0 };
  let total = 0;
  for (const group of collectionGroups) {
    const url = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/collectionGroups/${group}/indexes?pageSize=300`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${access_token}` } });
    const j = await r.json();
    const indexes = j.indexes || [];
    total += indexes.length;
    for (const i of indexes) {
      if (counts[i.state] !== undefined) counts[i.state]++;
      else counts.other++;
    }
  }
  return { total, ...counts };
}

const start = Date.now();
while (true) {
  const s = await poll();
  const elapsed = Math.round((Date.now() - start) / 1000);
  console.log(`[${elapsed}s] total=${s.total} CREATING=${s.CREATING} READY=${s.READY} other=${s.other}`);
  if (s.CREATING === 0) {
    console.log("All indexes settled.");
    break;
  }
  await new Promise((r) => setTimeout(r, 15000));
}
