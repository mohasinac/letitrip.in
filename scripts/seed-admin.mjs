#!/usr/bin/env node
/**
 * seed-admin.mjs — bootstrap the LetItRip admin into Firebase
 *
 * Seeds:
 *   • Firebase Auth user (admin@letitrip.in, role=admin via custom claim)
 *   • /users/{uid} Firestore doc (from usersSeedData[0])
 *   • /stores/{slug} doc for the admin's "store-letitrip-official"
 *   • /site_settings/global singleton (from siteSettingsSeedData)
 *   • /customRoles seed roles (Catalog Editor / Moderator)
 *   • /adminNotifications welcome inbox item
 *
 * Idempotent — checks Auth/Firestore state before creating.
 *
 * Usage:
 *   node scripts/seed-admin.mjs                 # production project from firebase-admin-key.json
 *   node scripts/seed-admin.mjs --dry-run       # show what would be written
 *   node scripts/seed-admin.mjs --project <id>  # override project ID
 *   node scripts/seed-admin.mjs --password <pw> # set admin Auth password
 *
 * Requires `firebase-admin-key.json` at the repo root (or env GOOGLE_APPLICATION_CREDENTIALS).
 */

import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const admin = require("firebase-admin");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = process.cwd();

const ADMIN_KEY_PATH = resolve(repoRoot, "firebase-admin-key.json");

// ── CLI helpers ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const hasFlag = (f) => args.includes(f);
const valOf = (f) => {
  const i = args.indexOf(f);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : null;
};

const DRY_RUN = hasFlag("--dry-run");
const PROJECT_OVERRIDE = valOf("--project") || process.env.FIREBASE_PROJECT_ID;
const ADMIN_PASSWORD = valOf("--password") || process.env.ADMIN_SEED_PASSWORD || "LetItRipAdmin@2026";

// ── Constants (mirror appkit/src/seed/users-seed-data.ts admin entry) ───
const ADMIN = {
  uid: "user-admin-letitrip",
  email: "admin@letitrip.in",
  phoneNumber: "+919876500000",
  displayName: "LetItRip Admin",
  role: "admin",
  storeId: "store-letitrip-official",
  storeSlug: "store-letitrip-official",
  storeStatus: "approved",
};

const ADMIN_STORE = {
  id: ADMIN.storeId,
  slug: ADMIN.storeSlug,
  ownerId: ADMIN.uid,
  storeName: "LetItRip Official",
  storeDescription:
    "Official LetItRip storefront — curated drops, platform-managed inventory, and exclusive bundles.",
  status: "approved",
  isVerified: true,
  isPublic: true,
  isFeatured: true,
};

const SITE_SETTINGS_DOC_ID = "global";
const SITE_SETTINGS_DEFAULTS = {
  id: SITE_SETTINGS_DOC_ID,
  branding: {
    name: "LetItRip",
    domain: "letitrip.in",
    tagline: "India's largest collectibles marketplace",
  },
  appearance: {
    primaryColor: "#6366f1",
    accentColor: "#ec4899",
    theme: "auto",
  },
  contactSocial: {
    supportEmail: "support@letitrip.in",
    phone: "+919876500000",
  },
  fees: {
    platformCommissionPercent: 5,
    razorpayFeePercent: 2,
  },
  platformLimits: {
    maxWishlistItems: 20,
    maxHistoryItems: 50,
    maxCartItems: 50,
  },
  featureFlags: {
    seedPanel: true,
    razorpay: true,
    cod: true,
    auctions: true,
    preOrders: true,
    bundles: true,
    prizeDraws: true,
    classified: true,
    digitalCodes: true,
    liveItems: true,
  },
};

const CUSTOM_ROLES = [
  {
    id: "custom-role-catalog-editor",
    name: "Catalog Editor",
    slug: "catalog-editor",
    description:
      "Read/write access to products, categories, brands. No order, payout, or user-management permissions.",
    permissions: [
      "admin:products:read",
      "admin:products:write",
      "admin:categories:read",
      "admin:categories:write",
      "admin:brands:read",
      "admin:brands:write",
      "admin:media:read",
      "admin:media:write",
    ],
    scope: "global",
    isActive: true,
    createdBy: ADMIN.uid,
  },
  {
    id: "custom-role-moderator",
    name: "Moderator",
    slug: "moderator",
    description:
      "Reviews moderation queue + reports. Cannot edit products or orders directly.",
    permissions: [
      "admin:moderation:read",
      "admin:moderation:write",
      "admin:reviews:read",
      "admin:reviews:write",
      "admin:reports:read",
      "admin:reports:write",
      "admin:scammers:read",
      "admin:support-tickets:read",
      "admin:support-tickets:write",
    ],
    scope: "global",
    isActive: true,
    createdBy: ADMIN.uid,
  },
];

const WELCOME_NOTIFICATION = {
  id: `adm-notif-welcome-${Date.now()}`,
  category: "system",
  title: "Welcome to LetItRip",
  body: "Admin seed bootstrapped. Visit /admin to start managing the platform.",
  severity: "info",
  isRead: false,
  audienceUserIds: [],
};

// ── Logging ────────────────────────────────────────────────────────────
function log(stage, msg) {
  console.log(`[seed-admin] ${stage}  ${msg}`);
}
function logDry(msg) {
  if (DRY_RUN) console.log(`[seed-admin] (dry-run)  ${msg}`);
}

// ── Helpers ────────────────────────────────────────────────────────────
async function ensureAuthUser(auth) {
  let user = null;
  try {
    user = await auth.getUser(ADMIN.uid);
    log("auth", `existing user ${ADMIN.uid} (${user.email ?? "?"})`);
  } catch {
    // Not found by uid — try by email
    try {
      user = await auth.getUserByEmail(ADMIN.email);
      log("auth", `existing user matched by email — uid=${user.uid}`);
    } catch {
      // Doesn't exist — create
    }
  }

  if (!user) {
    if (DRY_RUN) {
      logDry(`would create Auth user ${ADMIN.uid} (${ADMIN.email})`);
      return null;
    }
    user = await auth.createUser({
      uid: ADMIN.uid,
      email: ADMIN.email,
      emailVerified: true,
      phoneNumber: ADMIN.phoneNumber,
      displayName: ADMIN.displayName,
      password: ADMIN_PASSWORD,
      disabled: false,
    });
    log("auth", `created user ${user.uid}`);
  } else if (!DRY_RUN) {
    // Ensure verified + enabled
    await auth.updateUser(user.uid, {
      emailVerified: true,
      disabled: false,
      displayName: ADMIN.displayName,
    });
  }

  // Set custom claim role=admin on every run (cheap, idempotent).
  if (!DRY_RUN && user) {
    await auth.setCustomUserClaims(user.uid, { role: "admin" });
    log("auth", `custom claim role=admin set on ${user.uid}`);
  } else if (DRY_RUN) {
    logDry(`would set custom claim role=admin on ${ADMIN.uid}`);
  }

  return user;
}

async function upsertDoc(db, collection, id, data, label) {
  const ref = db.collection(collection).doc(id);
  const existing = await ref.get();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const payload = {
    ...data,
    updatedAt: now,
    ...(existing.exists ? {} : { createdAt: now }),
  };
  if (DRY_RUN) {
    logDry(
      `would ${existing.exists ? "update" : "create"} ${collection}/${id}${label ? ` (${label})` : ""}`,
    );
    return;
  }
  await ref.set(payload, { merge: true });
  log(
    "fs",
    `${existing.exists ? "updated" : "created"} ${collection}/${id}${label ? ` — ${label}` : ""}`,
  );
}

// ── Main ───────────────────────────────────────────────────────────────
async function main() {
  if (!existsSync(ADMIN_KEY_PATH) && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(
      `Missing service account: ${ADMIN_KEY_PATH}. Place firebase-admin-key.json at repo root or set GOOGLE_APPLICATION_CREDENTIALS.`,
    );
    process.exit(1);
  }

  const serviceAccount = existsSync(ADMIN_KEY_PATH) ? require(ADMIN_KEY_PATH) : null;
  const projectId =
    PROJECT_OVERRIDE || serviceAccount?.project_id || process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId) {
    console.error("Could not resolve Firebase project ID. Pass --project <id>.");
    process.exit(1);
  }

  log("init", `project=${projectId}${DRY_RUN ? " (dry-run)" : ""}`);

  const app = admin.initializeApp({
    credential: serviceAccount
      ? admin.credential.cert(serviceAccount)
      : admin.credential.applicationDefault(),
    projectId,
  });

  try {
    const auth = admin.auth(app);
    const db = admin.firestore(app);

    // 1. Auth user
    await ensureAuthUser(auth);

    // 2. /users/{uid}
    await upsertDoc(
      db,
      "users",
      ADMIN.uid,
      {
        uid: ADMIN.uid,
        email: ADMIN.email,
        phoneNumber: ADMIN.phoneNumber,
        phoneVerified: true,
        emailVerified: true,
        disabled: false,
        displayName: ADMIN.displayName,
        role: ADMIN.role,
        storeId: ADMIN.storeId,
        storeSlug: ADMIN.storeSlug,
        storeStatus: ADMIN.storeStatus,
        publicProfile: {
          isPublic: false,
          showEmail: false,
          showPhone: false,
          showOrders: false,
          showWishlist: false,
          bio: "LetItRip platform administrator.",
        },
        stats: { totalOrders: 0, auctionsWon: 0, itemsSold: 0, reviewsCount: 0 },
      },
      "admin user document",
    );

    // 3. /stores/{slug}
    await upsertDoc(
      db,
      "stores",
      ADMIN.storeId,
      ADMIN_STORE,
      "official admin store",
    );

    // 4. /site_settings/global
    await upsertDoc(
      db,
      "site_settings",
      SITE_SETTINGS_DOC_ID,
      SITE_SETTINGS_DEFAULTS,
      "global site settings",
    );

    // 5. /customRoles
    for (const role of CUSTOM_ROLES) {
      await upsertDoc(db, "customRoles", role.id, role, role.name);
    }

    // 6. /adminNotifications welcome
    if (!DRY_RUN) {
      const existing = await db
        .collection("adminNotifications")
        .where("category", "==", "system")
        .where("title", "==", WELCOME_NOTIFICATION.title)
        .limit(1)
        .get();
      if (existing.empty) {
        await db.collection("adminNotifications").doc(WELCOME_NOTIFICATION.id).set({
          ...WELCOME_NOTIFICATION,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        log("fs", `created adminNotifications/${WELCOME_NOTIFICATION.id} — welcome message`);
      } else {
        log("fs", `welcome adminNotifications already present`);
      }
    } else {
      logDry(`would create welcome adminNotifications entry`);
    }

    log("done", `✅ admin seed complete${DRY_RUN ? " (dry-run — nothing written)" : ""}`);
    if (!DRY_RUN) {
      console.log("");
      console.log(`  Email:    ${ADMIN.email}`);
      console.log(`  UID:      ${ADMIN.uid}`);
      console.log(`  Password: ${ADMIN_PASSWORD}`);
      console.log("");
      console.log("  Change the password from /user/settings after first sign-in.");
    }
  } finally {
    await app.delete();
  }
}

main().catch((err) => {
  console.error("[seed-admin] failed:", err);
  process.exit(1);
});
