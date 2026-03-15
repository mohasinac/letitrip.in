/**
 * Interactive prompt flow using Node.js built-in readline.
 * No external dependencies — works on Node 18+.
 */

import { createInterface } from "readline";
import type {
  DbProvider,
  AuthProvider,
  EmailProvider,
  StorageProvider,
  CssProvider,
  SearchProvider,
  PaymentProvider,
  ShippingProvider,
  ProviderSelections,
} from "./providers.js";
import type { FeatureDef } from "./features.js";
import { ALL_FEATURES } from "./features.js";

// ─── readline helpers ─────────────────────────────────────────────────────────

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function selectOne<T extends string>(
  question: string,
  options: Array<{ value: T; label: string; hint?: string }>,
  defaultValue: T,
): Promise<T> {
  console.log(`\n  ${question}`);
  options.forEach((o, i) => {
    const mark = o.value === defaultValue ? "*" : " ";
    const hint = o.hint ? `  — ${o.hint}` : "";
    console.log(`  ${mark} ${i + 1}) ${o.label}${hint}`);
  });
  const defIdx = options.findIndex((o) => o.value === defaultValue) + 1;
  const ans = await ask(`  Enter number [${defIdx}]: `);
  const n = parseInt(ans.trim() || String(defIdx), 10);
  return (options[n - 1]?.value ?? defaultValue) as T;
}

async function selectMany<T extends string>(
  question: string,
  options: Array<{ value: T; label: string; hint?: string }>,
  defaults: T[],
): Promise<T[]> {
  const defaultNums = defaults
    .map((d) => options.findIndex((o) => o.value === d) + 1)
    .filter((n) => n > 0);
  console.log(`\n  ${question}`);
  options.forEach((o, i) => {
    const mark = defaults.includes(o.value) ? "[x]" : "[ ]";
    const hint = o.hint ? `  — ${o.hint}` : "";
    console.log(`    ${i + 1}) ${mark} ${o.label}${hint}`);
  });
  const defStr = defaultNums.join(",");
  const ans = await ask(`  Enter numbers separated by commas [${defStr}]: `);
  const raw = ans.trim() || defStr;
  const picked = raw
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => n >= 1 && n <= options.length)
    .map((n) => options[n - 1]!.value);
  return picked.length > 0 ? picked : [...defaults];
}

// ─── exports ──────────────────────────────────────────────────────────────────

export interface ScaffoldSelections {
  projectName: string;
  locales: string[];
  providers: ProviderSelections;
  features: Set<string>;
  targetDir: string;
}

export async function runPrompts(): Promise<ScaffoldSelections> {
  console.log("\n  @mohasinac/create-app  —  scaffold a new project\n");

  // ── Project name ──────────────────────────────────────────────────────────
  let projectName = "";
  while (projectName.length < 2) {
    const raw = await ask("  Project name: ");
    projectName = raw.trim();
    if (projectName.length < 2)
      console.log("  Name must be at least 2 characters.");
  }

  // ── Target directory ───────────────────────────────────────────────────────
  const dirRaw = await ask(`  Output directory [./${projectName}]: `);
  const targetDir = dirRaw.trim() || `./${projectName}`;

  // ── Locales ────────────────────────────────────────────────────────────────
  const locales = await selectMany<string>(
    "Supported locales",
    [
      { value: "en", label: "English (en)" },
      { value: "hi", label: "Hindi (hi)" },
      { value: "mr", label: "Marathi (mr)" },
      { value: "ar", label: "Arabic (ar)" },
      { value: "fr", label: "French (fr)" },
      { value: "de", label: "German (de)" },
      { value: "es", label: "Spanish (es)" },
      { value: "pt", label: "Portuguese (pt)" },
      { value: "ja", label: "Japanese (ja)" },
      { value: "zh", label: "Chinese (zh)" },
    ],
    ["en"],
  );

  // ── Providers ──────────────────────────────────────────────────────────────
  console.log("\n  Choose one provider for each layer.\n");

  const db = await selectOne<DbProvider>(
    "Database",
    [
      {
        value: "firebase",
        label: "Firebase Firestore",
        hint: "NoSQL, serverless",
      },
      { value: "prisma", label: "Prisma", hint: "Postgres / MySQL / SQLite" },
      { value: "supabase", label: "Supabase", hint: "Postgres + realtime" },
      { value: "mongodb", label: "MongoDB", hint: "NoSQL, document" },
    ],
    "firebase",
  );

  const auth = await selectOne<AuthProvider>(
    "Authentication",
    [
      {
        value: "firebase",
        label: "Firebase Auth",
        hint: "OAuth, email, phone",
      },
      {
        value: "nextauth",
        label: "NextAuth v5",
        hint: "Flexible, many providers",
      },
      { value: "clerk", label: "Clerk", hint: "Drop-in UI + managed auth" },
    ],
    "firebase",
  );

  const email = await selectOne<EmailProvider>(
    "Email",
    [
      { value: "resend", label: "Resend", hint: "Developer-friendly, fast" },
      {
        value: "nodemailer",
        label: "Nodemailer",
        hint: "SMTP, any mail server",
      },
      { value: "sendgrid", label: "SendGrid", hint: "Twilio SendGrid" },
      { value: "postmark", label: "Postmark", hint: "High deliverability" },
    ],
    "resend",
  );

  const storage = await selectOne<StorageProvider>(
    "File Storage",
    [
      {
        value: "firebase",
        label: "Firebase Storage",
        hint: "GCS-backed, serverless",
      },
      { value: "s3", label: "AWS S3 / R2", hint: "S3-compatible buckets" },
      {
        value: "cloudinary",
        label: "Cloudinary",
        hint: "Media transforms + CDN",
      },
      {
        value: "uploadthing",
        label: "UploadThing",
        hint: "Simple file uploads",
      },
    ],
    "firebase",
  );

  const css = await selectOne<CssProvider>(
    "CSS framework",
    [
      {
        value: "tailwind",
        label: "Tailwind CSS",
        hint: "Utility-first, recommended",
      },
      {
        value: "vanilla",
        label: "Vanilla CSS vars",
        hint: "Pure CSS custom properties",
      },
    ],
    "tailwind",
  );

  const search = await selectOne<SearchProvider>(
    "Search (optional)",
    [
      { value: "none", label: "None" },
      { value: "algolia", label: "Algolia", hint: "Managed, fast" },
      {
        value: "typesense",
        label: "Typesense",
        hint: "Self-hosted / Typesense Cloud",
      },
      {
        value: "meilisearch",
        label: "Meilisearch",
        hint: "Self-hosted, open source",
      },
    ],
    "none",
  );

  const payment = await selectOne<PaymentProvider>(
    "Payments (optional)",
    [
      { value: "none", label: "None" },
      {
        value: "razorpay",
        label: "Razorpay",
        hint: "India-first, UPI + cards",
      },
      { value: "stripe", label: "Stripe", hint: "Global, cards + wallets" },
    ],
    "none",
  );

  const shipping = await selectOne<ShippingProvider>(
    "Shipping (optional)",
    [
      { value: "none", label: "None" },
      { value: "shiprocket", label: "Shiprocket", hint: "India multi-courier" },
      { value: "shippo", label: "Shippo", hint: "US / international" },
    ],
    "none",
  );

  // ── Features ───────────────────────────────────────────────────────────────
  const featureValues = await selectMany<string>(
    "Features to install",
    ALL_FEATURES.map((f: FeatureDef) => ({
      value: f.key,
      label: f.label,
      hint: f.hint,
    })),
    ["layout", "forms", "auth", "account", "homepage"],
  );

  rl.close();

  return {
    projectName,
    locales,
    providers: { db, auth, email, storage, css, search, payment, shipping },
    features: new Set(
      featureValues.length > 0 ? featureValues : ["layout", "forms"],
    ),
    targetDir,
  };
}
