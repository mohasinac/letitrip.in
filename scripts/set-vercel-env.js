#!/usr/bin/env node

/**
 * Set Vercel Environment Variables from .env.local
 * This script uses the Vercel API to set environment variables
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

function log(message, color = "white") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const envVars = {};

  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (trimmed.startsWith("#") || trimmed === "") {
      continue;
    }

    // Parse key=value
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      let key = match[1].trim();
      let value = match[2].trim();

      // Remove surrounding quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      if (value !== "") {
        envVars[key] = value;
      }
    }
  }

  return envVars;
}

async function setEnvVar(key, value) {
  return new Promise((resolve) => {
    try {
      // Create a temporary file with the value
      const tempFile = path.join(
        process.cwd(),
        `.temp_${key}_${Date.now()}.txt`,
      );
      fs.writeFileSync(tempFile, value, "utf8");

      // Use the temp file as input to vercel env add
      const command = `type "${tempFile}" | vercel env add ${key} production`;

      try {
        execSync(command, {
          stdio: "inherit",
          shell: "powershell.exe",
          timeout: 30000,
        });

        // Clean up temp file
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }

        resolve({ success: true, key });
      } catch (error) {
        // Clean up temp file on error
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }

        resolve({ success: false, key, error: error.message });
      }
    } catch (error) {
      resolve({ success: false, key, error: error.message });
    }
  });
}

async function main() {
  log("============================================", "cyan");
  log("Vercel Environment Variables Updater", "cyan");
  log("============================================", "cyan");
  console.log();

  // Determine which env file to use
  const useLocal = process.argv.includes("--local");
  const envFile = useLocal ? ".env.local" : ".env.production";

  // Check if env file exists
  if (!fs.existsSync(envFile)) {
    log(`Error: ${envFile} not found!`, "red");

    // Try fallback
    const fallback = envFile === ".env.production" ? ".env.local" : null;
    if (fallback && fs.existsSync(fallback)) {
      log(`Falling back to ${fallback}...`, "yellow");
      envFile = fallback;
    } else {
      process.exit(1);
    }
  }

  log(`Reading environment variables from ${envFile}...`, "yellow");
  const envVars = parseEnvFile(envFile);

  const keys = Object.keys(envVars);
  log(`Found ${keys.length} environment variables`, "green");
  console.log();

  // Check if vercel CLI is installed
  try {
    execSync("vercel --version", { stdio: "ignore" });
  } catch (error) {
    log("Vercel CLI not found. Installing...", "red");
    execSync("npm install -g vercel", { stdio: "inherit" });
  }

  // Check if project is linked
  if (!fs.existsSync(".vercel")) {
    log("Project not linked to Vercel. Please run: vercel link", "red");
    process.exit(1);
  }

  log("Setting environment variables in Vercel production...", "yellow");
  console.log();

  let successCount = 0;
  let failCount = 0;
  const failed = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = envVars[key];

    log(`[${i + 1}/${keys.length}] Setting: ${key}`, "white");

    const result = await setEnvVar(key, value);

    if (result.success) {
      successCount++;
      log("  ✓ Success", "green");
    } else {
      failCount++;
      failed.push({ key, error: result.error });
      log(`  ✗ Failed: ${result.error}`, "red");
    }

    console.log();
  }

  log("============================================", "cyan");
  log("Environment Variables Summary", "cyan");
  log("============================================", "cyan");
  console.log();
  log(`  Success: ${successCount}`, successCount > 0 ? "green" : "gray");
  log(`  Failed: ${failCount}`, failCount > 0 ? "red" : "green");
  console.log();

  if (failed.length > 0) {
    log("Failed Variables:", "yellow");
    failed.forEach(({ key, error }) => {
      log(`  - ${key}: ${error}`, "red");
    });
    console.log();
  }

  if (successCount > 0) {
    log("Next Steps:", "cyan");
    log("  1. Verify variables in Vercel Dashboard", "white");
    log("  2. Deploy to production: npm run deploy:prod:skip-env", "white");
    console.log();
  }

  if (failCount > 0) {
    log("Manual Setup Required:", "yellow");
    log("  Some variables could not be set automatically.", "white");
    log("  Please set them manually in Vercel Dashboard:", "white");
    log(
      "  https://vercel.com/dashboard -> Settings -> Environment Variables",
      "white",
    );
    console.log();
  }
}

main().catch((error) => {
  log(`Error: ${error.message}`, "red");
  process.exit(1);
});
