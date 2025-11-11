#!/usr/bin/env node

/**
 * Bulk Set Vercel Environment Variables
 * Reads from .env.local and sets all variables using vercel CLI
 */

const fs = require("fs");
const { spawn } = require("child_process");
const path = require("path");

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const useProduction = args.includes("--env=production");

const sourceFile = useProduction ? ".env.production" : ".env.local";

console.log("============================================");
console.log("Bulk Set Vercel Environment Variables");
console.log("============================================\n");

if (!fs.existsSync(sourceFile)) {
  console.error(`❌ Error: ${sourceFile} not found!`);
  process.exit(1);
}

console.log(`📖 Reading from: ${sourceFile}\n`);

// Parse environment variables
const envContent = fs.readFileSync(sourceFile, "utf8");
const envVars = {};

envContent.split("\n").forEach((line) => {
  line = line.trim();
  if (line.startsWith("#") || line === "") return;

  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let key = match[1].trim();
    let value = match[2].trim();

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    if (value) {
      envVars[key] = value;
    }
  }
});

const varCount = Object.keys(envVars).length;
console.log(`✓ Found ${varCount} environment variables\n`);

if (isDryRun) {
  console.log("🔍 DRY RUN MODE - Would set these variables:\n");
  Object.keys(envVars).forEach((key, i) => {
    console.log(`  ${i + 1}. ${key}`);
  });
  console.log("\nRun without --dry-run to actually set them");
  process.exit(0);
}

// Set variables one by one
async function setVariable(key, value, index, total) {
  return new Promise((resolve) => {
    process.stdout.write(`[${index + 1}/${total}] ${key}...`);

    const child = spawn(
      "vercel",
      ["env", "add", key, "production", "--force"],
      {
        stdio: ["pipe", "pipe", "pipe"],
        shell: true,
      }
    );

    child.stdin.write(value);
    child.stdin.end();

    let output = "";
    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      output += data.toString();
    });

    child.on("close", (code) => {
      if (
        code === 0 ||
        output.includes("Created") ||
        output.includes("Updated")
      ) {
        console.log(" ✓");
        resolve({ success: true, key });
      } else {
        console.log(" ✗");
        if (output) console.log(`    ${output.trim()}`);
        resolve({ success: false, key, error: output });
      }
    });
  });
}

async function main() {
  console.log("📤 Setting variables in Vercel production...\n");

  const entries = Object.entries(envVars);
  const results = [];

  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    const result = await setVariable(key, value, i, entries.length);
    results.push(result);
  }

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  console.log("\n============================================");
  console.log("Summary");
  console.log("============================================");
  console.log(`Total: ${varCount}`);
  console.log(`✓ Success: ${successCount}`);
  console.log(`✗ Failed: ${failCount}\n`);

  if (failCount > 0) {
    console.log("Failed variables:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.key}`);
      });
    console.log("");
  }

  if (successCount > 0) {
    console.log("✅ Environment variables set successfully!\n");
    console.log("Next: Deploy to production");
    console.log("  npm run deploy:prod:skip-env\n");
  }

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
