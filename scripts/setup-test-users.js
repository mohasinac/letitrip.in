/**
 * Setup test user sessions in Firebase
 * Creates admin and seller test users with valid sessions
 */

const admin = require("firebase-admin");
const { generateTestToken } = require("./test-auth-helpers");

// Initialize Firebase Admin using environment variables
if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n"
    );

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Firebase Admin environment variables not set");
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    console.log("✅ Firebase Admin initialized");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin:", error.message);
    console.log(
      "\n💡 Tip: Make sure FIREBASE_ADMIN_* environment variables are set"
    );
    process.exit(1);
  }
}

const db = admin.firestore();

/**
 * Create test admin user
 */
async function createTestAdmin() {
  const adminId = "test-admin-user-id";
  const email = "admin@test.com";

  console.log("Creating test admin user...");

  // Create user document
  await db.collection("users").doc(adminId).set({
    email,
    name: "Test Admin",
    role: "admin",
    is_banned: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Create session
  const { sessionId } = generateTestToken(adminId, email, "admin");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.collection("sessions").doc(sessionId).set({
    sessionId,
    userId: adminId,
    email,
    role: "admin",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    lastActivity: now.toISOString(),
  });

  console.log("✅ Test admin created:", adminId);
  return adminId;
}

/**
 * Create test seller user
 */
async function createTestSeller() {
  const sellerId = "test-seller";
  const email = "test-seller@test.com";

  console.log("Creating test seller user...");

  // Create user document
  await db.collection("users").doc(sellerId).set({
    email,
    name: "Test Seller",
    role: "seller",
    is_banned: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Create session
  const { sessionId } = generateTestToken(sellerId, email, "seller");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.collection("sessions").doc(sessionId).set({
    sessionId,
    userId: sellerId,
    email,
    role: "seller",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    lastActivity: now.toISOString(),
  });

  console.log("✅ Test seller created:", sellerId);
  return sellerId;
}

/**
 * Cleanup test users and sessions
 */
async function cleanupTestUsers() {
  console.log("Cleaning up test users and sessions...");

  // Delete test users
  await db
    .collection("users")
    .doc("test-admin-user-id")
    .delete()
    .catch(() => {});
  await db
    .collection("users")
    .doc("test-seller")
    .delete()
    .catch(() => {});

  // Delete test sessions
  const sessions = await db
    .collection("sessions")
    .where("userId", "in", ["test-admin-user-id", "test-seller"])
    .get();

  for (const doc of sessions.docs) {
    await doc.ref.delete();
  }

  console.log("✅ Test users cleaned up");
}

/**
 * Main setup
 */
async function setupTestUsers() {
  try {
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║  Setup Test Users for Bulk API Tests  ║");
    console.log("╚════════════════════════════════════════╝\n");

    // Cleanup existing test users
    await cleanupTestUsers();

    // Create new test users
    await createTestAdmin();
    await createTestSeller();

    console.log("\n✅ Test users setup complete!");
    console.log("\nYou can now run: npm run test:bulk-actions\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Setup failed:", error);
    process.exit(1);
  }
}

// Run setup
if (require.main === module) {
  setupTestUsers();
}

module.exports = {
  createTestAdmin,
  createTestSeller,
  cleanupTestUsers,
};
