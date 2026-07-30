/**
 * One-time script: set Firebase Auth custom claims for test users.
 * Run: node scripts/set-test-user-claims.mjs
 */
import { readFileSync } from "fs";
import { initializeApp, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const envLocal = readFileSync("d:/proj/letitrip.in/.env.local", "utf8");
const envVars = {};
for (const line of envLocal.split("\n")) {
  const m = line.match(/^([A-Z_]+)="([\s\S]*?)"$/);
  if (m) envVars[m[1]] = m[2].replace(/\\n/g, "\n");
}

const { FIREBASE_ADMIN_PROJECT_ID: projectId, FIREBASE_ADMIN_CLIENT_EMAIL: clientEmail, FIREBASE_ADMIN_PRIVATE_KEY: privateKey } = envVars;
let app; try { app = getApp(); } catch { app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }); }
const auth = getAuth(app);

const CLAIMS = [
  // Sellers need role=seller claim so /store/* routes accept them
  { uid: "user-seto-kaiba",   claims: { role: "seller" } },
  { uid: "user-ash-trainer",  claims: { role: "seller" } },
  { uid: "user-priya-sharma", claims: { role: "seller" } },
  { uid: "user-rajesh-gupta", claims: { role: "seller" } },
  { uid: "user-arjun-mehta",  claims: { role: "seller" } },
  { uid: "user-kenji-tanaka", claims: { role: "seller" } },
  { uid: "user-maria-santos", claims: { role: "seller" } },
  // Admin already exists with correct claims
];

async function main() {
  for (const { uid, claims } of CLAIMS) {
    try {
      await auth.setCustomUserClaims(uid, claims);
      console.log(`✓ Set claims for ${uid}:`, claims);
    } catch (e) {
      console.error(`✗ Error for ${uid}: ${e.message}`);
    }
  }
  console.log("Done.");
}

main().catch(console.error).finally(() => process.exit(0));
