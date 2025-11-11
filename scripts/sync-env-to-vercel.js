#!/usr/bin/env node

/**
 * Sync Environment Variables to Vercel Production
 * Uses Vercel API to set environment variables from .env file
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const useProduction = args.includes("--env=production");

// Determine source file
let sourceFile = ".env.local";
if (useProduction) {
  sourceFile = ".env.production";
} else if (args.length > 0 && !args[0].startsWith("--")) {
  sourceFile = args[0];
}

console.log("============================================");
console.log("Vercel Environment Variables Sync");
console.log("============================================\n");

// Check if file exists
if (!fs.existsSync(sourceFile)) {
  console.error(`❌ Error: ${sourceFile} not found!`);
  console.error(`Available: .env.local, .env.production`);
  process.exit(1);
}

// Parse environment variables
console.log(`📖 Reading from: ${sourceFile}`);
const envContent = fs.readFileSync(sourceFile, "utf8");
const envVars = {};

envContent.split("\n").forEach((line) => {
  line = line.trim();

  // Skip comments and empty lines
  if (line.startsWith("#") || line === "") return;

  // Parse key=value
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let key = match[1].trim();
    let value = match[2].trim();

    // Remove surrounding quotes
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
  console.log("🔍 DRY RUN MODE - Variables to be set:\n");
  Object.entries(envVars).forEach(([key, value]) => {
    const preview = value.length > 50 ? `${value.substring(0, 47)}...` : value;
    console.log(`  ${key} = ${preview}`);
  });
  console.log("\nRun without --dry-run to execute");
  process.exit(0);
}

// Function to set a single environment variable
function setEnvVar(key, value) {
  try {
    // Create a temp file with the value
    const tempFile = path.join(process.cwd(), `.env.tmp.${Date.now()}`);
    fs.writeFileSync(tempFile, value);

    try {
      // Use vercel env add with --force to update
      const cmd = `vercel env add ${key} production --force < "${tempFile}"`;
      execSync(cmd, {
        stdio: "pipe",
        shell: true,
        windowsHide: true,
      });

      fs.unlinkSync(tempFile);
      return { success: true };
    } catch (error) {
      fs.unlinkSync(tempFile);
      return { success: false, error: error.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Set all environment variables
console.log("📤 Setting environment variables in Vercel production...\n");

let successCount = 0;
let failCount = 0;
const failed = [];

Object.entries(envVars).forEach(([key, value], index) => {
  const preview = value.length > 50 ? `${value.substring(0, 47)}...` : value;
  process.stdout.write(`[${index + 1}/${varCount}] Setting: ${key} `);

  const result = setEnvVar(key, value);

  if (result.success) {
    console.log("✓");
    successCount++;
  } else {
    console.log("✗");
    console.log(`    Error: ${result.error}`);
    failCount++;
    failed.push(key);
  }
});

console.log("\n============================================");
console.log("Environment Variables Summary");
console.log("============================================");
console.log(`  Total: ${varCount}`);
console.log(`  ✓ Success: ${successCount}`);
console.log(`  ✗ Failed: ${failCount}`);
console.log("");

if (successCount > 0) {
  console.log("✅ Environment variables successfully synced to Vercel!\n");
  console.log("Next steps:");
  console.log("  1. Deploy: npm run deploy:prod:skip-env");
  console.log("  2. Or use: vercel --prod\n");
}

if (failCount > 0) {
  console.log("⚠️  Some variables failed to update:\n");
  failed.forEach((key) => console.log(`  - ${key}`));
  console.log("\nTo set manually:");
  console.log("  1. Visit: https://vercel.com/dashboard");
  console.log("  2. Select your project");
  console.log("  3. Settings → Environment Variables\n");
  process.exit(1);
}
