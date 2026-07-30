/**
 * One-time script: create Firebase Auth accounts for E2E test users.
 * Run: node scripts/create-test-auth-users.mjs
 */
import { readFileSync } from "fs";
import { initializeApp, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Load .env.local manually
const envLocal = readFileSync("d:/proj/letitrip.in/.env.local", "utf8");
const envVars = {};
for (const line of envLocal.split("\n")) {
  const m = line.match(/^([A-Z_]+)="([\s\S]*?)"$/);
  if (m) envVars[m[1]] = m[2].replace(/\\n/g, "\n");
}

const projectId = envVars.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = envVars.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = envVars.FIREBASE_ADMIN_PRIVATE_KEY;

let app;
try { app = getApp(); } catch { app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }); }
const auth = getAuth(app);

const TEST_USERS = [
  { uid: "user-seto-kaiba",    email: "kaiba@kaibalandmark.in",   displayName: "Seto Kaiba",    phone: "+919999900001" },
  { uid: "user-yugi-muto",     email: "yugi@duelkingdom.in",      displayName: "Yugi Muto",     phone: "+919999900002" },
  { uid: "user-ash-trainer",   email: "ash@pokemonpalace.in",     displayName: "Ash Ketchum",   phone: "+919999900003" },
  { uid: "user-priya-sharma",  email: "priya@cardgamehub.in",     displayName: "Priya Sharma",  phone: "+919999900004" },
  { uid: "user-rajesh-gupta",  email: "rajesh@diecastdepot.in",   displayName: "Rajesh Gupta",  phone: "+919999900005" },
  { uid: "user-arjun-mehta",   email: "arjun@beyarenaindia.in",   displayName: "Arjun Mehta",   phone: "+919999900006" },
  { uid: "user-kenji-tanaka",  email: "kenji@tokyotoysindia.in",  displayName: "Kenji Tanaka",  phone: "+919999900007" },
  { uid: "user-maria-santos",  email: "maria@vintagevault.in",    displayName: "Maria Santos",  phone: "+919999900008" },
  { uid: "user-ravi-kumar",    email: "ravi@example.com",         displayName: "Ravi Kumar",    phone: "+919999900009" },
  { uid: "user-ananya-patel",  email: "ananya@example.com",       displayName: "Ananya Patel",  phone: "+919999900010" },
  { uid: "user-vikram-singh",  email: "vikram@example.com",       displayName: "Vikram Singh",  phone: "+919999900011" },
  { uid: "user-deepika-rao",   email: "deepika@example.com",      displayName: "Deepika Rao",   phone: "+919999900012" },
  { uid: "user-amit-joshi",    email: "amit@example.com",         displayName: "Amit Joshi",    phone: "+919999900013" },
  { uid: "user-sunita-verma",  email: "sunita@example.com",       displayName: "Sunita Verma",  phone: "+919999900014" },
  { uid: "user-krishna-nair",  email: "krishna@example.com",      displayName: "Krishna Nair",  phone: "+919999900015" },
  { uid: "user-pooja-desai",   email: "pooja@example.com",        displayName: "Pooja Desai",   phone: "+919999900016" },
  { uid: "user-mohit-agarwal", email: "mohit@example.com",        displayName: "Mohit Agarwal", phone: "+919999900017" },
];

const PASSWORD = "TempPass123!";

async function main() {
  let created = 0, updated = 0, errors = 0;

  for (const u of TEST_USERS) {
    try {
      // Check if user already exists
      let exists = false;
      try {
        await auth.getUser(u.uid);
        exists = true;
      } catch (e) {
        if (e.code !== "auth/user-not-found") throw e;
      }

      if (exists) {
        await auth.updateUser(u.uid, {
          email: u.email,
          displayName: u.displayName,
          emailVerified: true,
        });
        console.log(`✓ Updated: ${u.email} (${u.uid})`);
        updated++;
      } else {
        // Try without phone first (phone conflicts are common)
        try {
          await auth.createUser({
            uid: u.uid,
            email: u.email,
            password: PASSWORD,
            displayName: u.displayName,
            emailVerified: true,
          });
          console.log(`✓ Created: ${u.email} (${u.uid})`);
        } catch (createErr) {
          if (createErr.code === "auth/email-already-exists") {
            // Another account has this email — delete it and recreate
            const conflict = await auth.getUserByEmail(u.email);
            console.log(`  Removing conflicting account ${conflict.uid} for ${u.email}`);
            await auth.deleteUser(conflict.uid);
            await auth.createUser({
              uid: u.uid,
              email: u.email,
              password: PASSWORD,
              displayName: u.displayName,
              emailVerified: true,
            });
            console.log(`✓ Created (after conflict resolution): ${u.email} (${u.uid})`);
          } else {
            throw createErr;
          }
        }
        created++;
      }
    } catch (e) {
      console.error(`✗ Error for ${u.email}: ${e.code} — ${e.message}`);
      errors++;
    }
  }

  console.log(`\nDone. Created: ${created}, Updated: ${updated}, Errors: ${errors}`);
}

main().catch(console.error).finally(() => process.exit(0));
