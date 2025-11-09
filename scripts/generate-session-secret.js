/**
 * Generate a secure random session secret
 * Run this script to generate a SESSION_SECRET for your .env.local file
 *
 * Usage:
 * node scripts/generate-session-secret.js
 */

const crypto = require("crypto");

function generateSessionSecret() {
  // Generate a 64-byte random string and convert to hex (128 characters)
  const secret = crypto.randomBytes(64).toString("hex");
  return secret;
}

console.log("=".repeat(80));
console.log("SESSION SECRET GENERATOR");
console.log("=".repeat(80));
console.log("\nYour new session secret:\n");
console.log(generateSessionSecret());
console.log("\nAdd this to your .env.local file:");
console.log("SESSION_SECRET=<your-generated-secret>\n");
console.log(
  "⚠️  IMPORTANT: Keep this secret secure and never commit to version control!",
);
console.log("=".repeat(80));
