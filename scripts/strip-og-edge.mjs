#!/usr/bin/env node
// One-shot: drop `export const runtime = "edge";` from all OG image routes.
// OG routes that import from `@mohasinac/appkit/server` pull in
// `features/auth/{token-store,consent-otp}.js` which use `crypto` —
// incompatible with the edge runtime. Defaulting to Node (`runtime`
// declaration omitted) unblocks `npm run build`. Tracked as OG-FIX1.
import fs from "fs";

const files = [
  "src/app/[locale]/auctions/[id]/opengraph-image.tsx",
  "src/app/[locale]/blog/[slug]/opengraph-image.tsx",
  "src/app/[locale]/brands/[slug]/opengraph-image.tsx",
  "src/app/[locale]/events/[id]/opengraph-image.tsx",
  "src/app/[locale]/pre-orders/[id]/opengraph-image.tsx",
  "src/app/[locale]/products/[slug]/opengraph-image.tsx",
  "src/app/[locale]/profile/[userId]/opengraph-image.tsx",
  "src/app/[locale]/stores/[storeSlug]/opengraph-image.tsx",
  "src/app/[locale]/sublisting-categories/[slug]/opengraph-image.tsx",
];

const PATTERN = /^export const runtime = "edge";\s*\n/m;
const REPLACEMENT =
  '// OG-FIX1: removed `export const runtime = "edge"` — the @mohasinac/appkit/server\n' +
  '// chain pulls in node:crypto via features/auth/{token-store,consent-otp}. Node\n' +
  "// runtime is the default; cold start is slightly slower but functional.\n";

let changed = 0;
for (const rel of files) {
  const src = fs.readFileSync(rel, "utf8");
  if (!PATTERN.test(src)) continue;
  fs.writeFileSync(rel, src.replace(PATTERN, REPLACEMENT));
  changed++;
}
console.log(`[strip-og-edge] dropped runtime=edge from ${changed} file(s).`);
