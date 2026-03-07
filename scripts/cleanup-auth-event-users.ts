/**
 * One-shot cleanup: delete all Firebase Auth users with a UID starting with
 * "auth_event_".  These are synthetic users created as a side-effect of
 * signInWithCustomToken() in the OAuth popup flow and should have been deleted
 * by the callback route — but weren't before the fix was applied.
 *
 * Usage:
 *   npx ts-node scripts/cleanup-auth-event-users.ts
 */

import { getAdminAuth } from "@/lib/firebase/admin";

async function main() {
  const auth = getAdminAuth();
  const toDelete: string[] = [];

  let pageToken: string | undefined;
  do {
    const result = await auth.listUsers(1000, pageToken);
    for (const user of result.users) {
      if (user.uid.startsWith("auth_event_")) {
        toDelete.push(user.uid);
      }
    }
    pageToken = result.pageToken;
  } while (pageToken);

  if (toDelete.length === 0) {
    console.log("No auth_event_ users found.");
    return;
  }

  console.log(`Found ${toDelete.length} auth_event_ user(s) — deleting...`);

  // deleteUsers accepts up to 1000 UIDs at a time
  for (let i = 0; i < toDelete.length; i += 1000) {
    const batch = toDelete.slice(i, i + 1000);
    const result = await auth.deleteUsers(batch);
    console.log(
      `Batch deleted: ${result.successCount} ok, ${result.failureCount} failed`,
    );
    if (result.errors.length > 0) {
      for (const e of result.errors) {
        console.error(`  UID ${batch[e.index]}: ${e.error.message}`);
      }
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
