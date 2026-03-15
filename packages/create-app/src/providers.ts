/**
 * Provider definitions — env keys, import paths, and config template generators.
 * One source of truth for every concrete provider @mohasinac supports.
 */

// ─── DB providers ─────────────────────────────────────────────────────────────

export type DbProvider = "firebase" | "prisma" | "supabase" | "mongodb";
export type AuthProvider = "firebase" | "nextauth" | "clerk";
export type EmailProvider = "resend" | "nodemailer" | "sendgrid" | "postmark";
export type StorageProvider = "firebase" | "s3" | "cloudinary" | "uploadthing";
export type CssProvider = "tailwind" | "vanilla";
export type SearchProvider = "algolia" | "typesense" | "meilisearch" | "none";
export type PaymentProvider = "razorpay" | "stripe" | "none";
export type ShippingProvider = "shiprocket" | "shippo" | "none";

export interface ProviderSelections {
  db: DbProvider;
  auth: AuthProvider;
  email: EmailProvider;
  storage: StorageProvider;
  css: CssProvider;
  search: SearchProvider;
  payment: PaymentProvider;
  shipping: ShippingProvider;
}

// ─── Env key registry ─────────────────────────────────────────────────────────

export const ENV_KEYS: Record<string, string[]> = {
  // DB
  "db.firebase": [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ],
  "db.prisma": ["DATABASE_URL"],
  "db.supabase": [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ],
  "db.mongodb": ["MONGODB_URI"],

  // Auth
  "auth.firebase": [], // shares DB Firebase keys
  "auth.nextauth": ["NEXTAUTH_SECRET", "NEXTAUTH_URL"],
  "auth.clerk": [
    "CLERK_SECRET_KEY",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
    "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  ],

  // Email
  "email.resend": ["RESEND_API_KEY"],
  "email.nodemailer": [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "SMTP_FROM",
  ],
  "email.sendgrid": ["SENDGRID_API_KEY"],
  "email.postmark": ["POSTMARK_SERVER_TOKEN"],

  // Storage
  "storage.firebase": [], // shares DB Firebase keys
  "storage.s3": [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
    "AWS_S3_BUCKET",
  ],
  "storage.cloudinary": [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ],
  "storage.uploadthing": ["UPLOADTHING_SECRET", "UPLOADTHING_APP_ID"],

  // Search
  "search.algolia": [
    "ALGOLIA_APP_ID",
    "ALGOLIA_API_KEY",
    "NEXT_PUBLIC_ALGOLIA_APP_ID",
    "NEXT_PUBLIC_ALGOLIA_SEARCH_KEY",
  ],
  "search.typesense": [
    "TYPESENSE_HOST",
    "TYPESENSE_PORT",
    "TYPESENSE_PROTOCOL",
    "TYPESENSE_API_KEY",
  ],
  "search.meilisearch": ["MEILISEARCH_HOST", "MEILISEARCH_MASTER_KEY"],

  // Payment
  "payment.razorpay": [
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
  ],
  "payment.stripe": [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  ],

  // Shipping
  "shipping.shiprocket": ["SHIPROCKET_EMAIL", "SHIPROCKET_PASSWORD"],
  "shipping.shippo": ["SHIPPO_API_KEY"],
};

/** Collect all unique env keys for a set of provider selections. */
export function collectEnvKeys(selections: ProviderSelections): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  const add = (keys: string[]) => {
    for (const k of keys) {
      if (!seen.has(k)) {
        seen.add(k);
        result.push(k);
      }
    }
  };

  add(ENV_KEYS[`db.${selections.db}`] ?? []);
  add(ENV_KEYS[`auth.${selections.auth}`] ?? []);
  add(ENV_KEYS[`email.${selections.email}`] ?? []);
  add(ENV_KEYS[`storage.${selections.storage}`] ?? []);
  if (selections.search !== "none")
    add(ENV_KEYS[`search.${selections.search}`] ?? []);
  if (selections.payment !== "none")
    add(ENV_KEYS[`payment.${selections.payment}`] ?? []);
  if (selections.shipping !== "none")
    add(ENV_KEYS[`shipping.${selections.shipping}`] ?? []);

  return result;
}

// ─── providers.config.ts generator ───────────────────────────────────────────

/** Provider package import paths */
const PROVIDER_IMPORTS: Record<string, { pkg: string; imports: string[] }> = {
  "db.firebase": {
    pkg: "@mohasinac/db-firebase",
    imports: [],
  },
  "auth.firebase": {
    pkg: "@mohasinac/auth-firebase",
    imports: ["firebaseAuthProvider", "firebaseSessionProvider"],
  },
  "auth.nextauth": {
    pkg: "@mohasinac/auth-nextauth",
    imports: ["nextAuthProvider", "nextAuthSessionProvider"],
  },
  "auth.clerk": {
    pkg: "@mohasinac/auth-clerk",
    imports: ["clerkAuthProvider", "clerkSessionProvider"],
  },
  "email.resend": {
    pkg: "@mohasinac/email-resend",
    imports: ["createResendProvider"],
  },
  "email.nodemailer": {
    pkg: "@mohasinac/email-nodemailer",
    imports: ["createNodemailerProvider"],
  },
  "email.sendgrid": {
    pkg: "@mohasinac/email-sendgrid",
    imports: ["createSendGridProvider"],
  },
  "email.postmark": {
    pkg: "@mohasinac/email-postmark",
    imports: ["createPostmarkProvider"],
  },
  "storage.firebase": {
    pkg: "@mohasinac/storage-firebase",
    imports: ["firebaseStorageProvider"],
  },
  "storage.s3": {
    pkg: "@mohasinac/storage-s3",
    imports: ["createS3Provider"],
  },
  "storage.cloudinary": {
    pkg: "@mohasinac/storage-cloudinary",
    imports: ["createCloudinaryProvider"],
  },
  "storage.uploadthing": {
    pkg: "@mohasinac/storage-uploadthing",
    imports: ["createUploadThingProvider"],
  },
  "css.tailwind": {
    pkg: "@mohasinac/css-tailwind",
    imports: ["tailwindAdapter"],
  },
  "css.vanilla": {
    pkg: "@mohasinac/css-vanilla",
    imports: ["vanillaAdapter"],
  },
  "search.algolia": {
    pkg: "@mohasinac/search-algolia",
    imports: ["createAlgoliaProvider"],
  },
  "search.typesense": {
    pkg: "@mohasinac/search-typesense",
    imports: ["createTypesenseProvider"],
  },
  "search.meilisearch": {
    pkg: "@mohasinac/search-meilisearch",
    imports: ["createMeilisearchProvider"],
  },
  "payment.razorpay": {
    pkg: "@mohasinac/payment-razorpay",
    imports: ["createRazorpayProvider"],
  },
  "payment.stripe": {
    pkg: "@mohasinac/payment-stripe",
    imports: ["createStripeProvider"],
  },
  "shipping.shiprocket": {
    pkg: "@mohasinac/shipping-shiprocket",
    imports: ["createShiprocketProvider"],
  },
  "shipping.shippo": {
    pkg: "@mohasinac/shipping-shippo",
    imports: ["createShippoProvider"],
  },
};

function importLine(key: string): string {
  const def = PROVIDER_IMPORTS[key];
  if (!def || def.imports.length === 0) return "";
  return `import { ${def.imports.join(", ")} } from "${def.pkg}";`;
}

function authValue(auth: AuthProvider): string {
  if (auth === "firebase") return "firebaseAuthProvider";
  if (auth === "nextauth") return "nextAuthProvider";
  return "clerkAuthProvider";
}

function sessionValue(auth: AuthProvider): string {
  if (auth === "firebase") return "firebaseSessionProvider";
  if (auth === "nextauth") return "nextAuthSessionProvider";
  return "clerkSessionProvider";
}

function emailValue(email: EmailProvider): string {
  if (email === "resend") return "createResendProvider({})";
  if (email === "nodemailer")
    return `createNodemailerProvider({\n  host: process.env.SMTP_HOST!,\n  port: Number(process.env.SMTP_PORT ?? 587),\n  user: process.env.SMTP_USER!,\n  password: process.env.SMTP_PASSWORD!,\n  from: process.env.SMTP_FROM!,\n})`;
  if (email === "sendgrid")
    return "createSendGridProvider({ apiKey: process.env.SENDGRID_API_KEY! })";
  return "createPostmarkProvider({ serverToken: process.env.POSTMARK_SERVER_TOKEN! })";
}

function storageValue(storage: StorageProvider): string {
  if (storage === "firebase") return "firebaseStorageProvider";
  if (storage === "s3")
    return `createS3Provider({\n  region: process.env.AWS_REGION!,\n  bucket: process.env.AWS_S3_BUCKET!,\n  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,\n  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,\n})`;
  if (storage === "cloudinary")
    return `createCloudinaryProvider({\n  cloudName: process.env.CLOUDINARY_CLOUD_NAME!,\n  apiKey: process.env.CLOUDINARY_API_KEY!,\n  apiSecret: process.env.CLOUDINARY_API_SECRET!,\n})`;
  return `createUploadThingProvider({\n  secret: process.env.UPLOADTHING_SECRET!,\n  appId: process.env.UPLOADTHING_APP_ID!,\n})`;
}

function cssValue(css: CssProvider): string {
  return css === "tailwind" ? "tailwindAdapter" : "vanillaAdapter";
}

function searchLines(search: SearchProvider): string {
  if (search === "none") return "";
  if (search === "algolia")
    return `  search: createAlgoliaProvider({\n    appId: process.env.ALGOLIA_APP_ID!,\n    apiKey: process.env.ALGOLIA_API_KEY!,\n  }),`;
  if (search === "typesense")
    return `  search: createTypesenseProvider({\n    host: process.env.TYPESENSE_HOST!,\n    port: Number(process.env.TYPESENSE_PORT ?? 8108),\n    protocol: process.env.TYPESENSE_PROTOCOL ?? "http",\n    apiKey: process.env.TYPESENSE_API_KEY!,\n  }),`;
  return `  search: createMeilisearchProvider({\n    host: process.env.MEILISEARCH_HOST!,\n    masterKey: process.env.MEILISEARCH_MASTER_KEY,\n  }),`;
}

function paymentLines(payment: PaymentProvider): string {
  if (payment === "none") return "";
  if (payment === "razorpay")
    return `  payment: createRazorpayProvider({\n    keyId: process.env.RAZORPAY_KEY_ID!,\n    keySecret: process.env.RAZORPAY_KEY_SECRET!,\n    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET!,\n  }),`;
  return `  payment: createStripeProvider({\n    secretKey: process.env.STRIPE_SECRET_KEY!,\n    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,\n  }),`;
}

function shippingLines(shipping: ShippingProvider): string {
  if (shipping === "none") return "";
  if (shipping === "shiprocket")
    return `  shipping: createShiprocketProvider({\n    email: process.env.SHIPROCKET_EMAIL!,\n    password: process.env.SHIPROCKET_PASSWORD!,\n  }),`;
  return `  shipping: createShippoProvider({ apiKey: process.env.SHIPPO_API_KEY! }),`;
}

/** Generate providers.config.ts content from provider selections. */
export function generateProvidersConfig(s: ProviderSelections): string {
  const lines: string[] = [
    `import { registerProviders } from "@mohasinac/contracts";`,
    importLine(`auth.${s.auth}`),
    importLine(`email.${s.email}`),
    importLine(`storage.${s.storage}`),
    importLine(`css.${s.css}`),
    s.search !== "none" ? importLine(`search.${s.search}`) : "",
    s.payment !== "none" ? importLine(`payment.${s.payment}`) : "",
    s.shipping !== "none" ? importLine(`shipping.${s.shipping}`) : "",
  ]
    .filter(Boolean)
    .join("\n");

  const optionalLines = [
    searchLines(s.search),
    paymentLines(s.payment),
    shippingLines(s.shipping),
  ]
    .filter(Boolean)
    .join("\n");

  return `${lines}

registerProviders({
  auth: ${authValue(s.auth)},
  session: ${sessionValue(s.auth)},
  email: ${emailValue(s.email)},
  storage: ${storageValue(s.storage)},
  style: ${cssValue(s.css)},
${optionalLines ? optionalLines + "\n" : ""}});
`;
}
