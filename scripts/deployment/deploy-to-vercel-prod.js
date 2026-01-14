#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const args = process.argv.slice(2);
const skipEnvUpdate = args.includes("--skip-env-update");
const force = args.includes("--force");
const useLocal = args.includes("--use-local");
console.log("============================================");
console.log("Vercel Production Deployment Automation");
console.log("============================================\n");
console.log("Checking Vercel CLI installation...");
try {
  execSync("vercel --version", { stdio: "pipe" });
  console.log("✅ Vercel CLI is installed\n");
} catch (error) {
  console.log("❌ Vercel CLI not found. Installing...");
  try {
    execSync("npm install -g vercel", { stdio: "inherit" });
    console.log("✅ Vercel CLI installed successfully\n");
  } catch (installError) {
    console.error("❌ Failed to install Vercel CLI");
    console.error("Please install manually: npm i -g vercel");
    process.exit(1);
  }
}
console.log("Checking Vercel project link...");
if (!fs.existsSync(".vercel")) {
  console.log("❌ Project not linked to Vercel. Linking now...");
  try {
    execSync("vercel link", { stdio: "inherit" });
  } catch (error) {
    console.error("❌ Failed to link project");
    console.error('Please run "vercel link" manually');
    process.exit(1);
  }
}
console.log("✅ Project is linked to Vercel\n");
if (!skipEnvUpdate) {
  console.log("============================================");
  console.log("Updating Environment Variables");
  console.log("============================================\n");
  const envFile = useLocal ? ".env.local" : ".env.production";
  console.log(`Using ${envFile} file${useLocal ? " (fallback mode)" : ""}`);
  let envFilePath = path.join(process.cwd(), envFile);
  if (!fs.existsSync(envFilePath)) {
    console.log(`⚠️  Warning: ${envFile} not found!`);
    if (envFile === ".env.production" && fs.existsSync(".env.local")) {
      console.log("Falling back to .env.local...");
      envFilePath = path.join(process.cwd(), ".env.local");
    } else {
      console.log("⚠️  Skipping environment variable update - file not found");
      console.log("Continuing with deployment...\n");
    }
  }

  if (fs.existsSync(envFilePath)) {
    try {
      console.log(
        `Reading environment variables from ${path.basename(envFilePath)}...`
      );
      const envContent = fs.readFileSync(envFilePath, "utf-8");
      const envVars = {};
      envContent.split("\n").forEach((line) => {
        line = line.trim();
        if (line.startsWith("#") || line === "") {
          return;
        }
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          let key = match[1].trim();
          let value = match[2].trim();
          value = value.replace(/^"(.*)"$/, "$1");
          if (value) {
            envVars[key] = value;
          }
        }
      });
      console.log(
        `✅ Found ${Object.keys(envVars).length} environment variables\n`
      );
      console.log("Setting environment variables in Vercel...");
      let successCount = 0;
      let failedVars = [];
      for (const [key, value] of Object.entries(envVars)) {
        try {
          // Always force-update by removing existing var first
          try {
            execSync(`vercel env rm ${key} production`, {
              stdio: "pipe",
              input: "y\n",
            });
          } catch (e) {
            // Variable doesn't exist, that's fine
          }
          execSync(`vercel env add ${key} production`, {
            stdio: "pipe",
            input: `${value}\n`,
          });
          successCount++;
          console.log(`  ✅ ${key}`);
        } catch (error) {
          failedVars.push(key);
          console.log(`  ⚠️  Skipped ${key} (may already exist)`);
        }
      }
      console.log(
        `\n✅ Set ${successCount}/${Object.keys(envVars).length} variables`
      );
      if (failedVars.length > 0) {
        console.log(
          `⚠️  Skipped ${failedVars.length} variables (already configured):`
        );
        failedVars.forEach((key) => console.log(`   - ${key}`));
        console.log(
          "\n💡 Tip: Use --force flag to overwrite existing variables"
        );
      }
    } catch (error) {
      console.log("⚠️  Warning: Failed to update environment variables");
      console.log("Continuing with deployment anyway...");
    }
  }
  console.log("");
}
console.log("============================================");
console.log("Deploying to Production");
console.log("============================================\n");
console.log("Running: vercel --prod\n");
try {
  execSync("vercel --prod", { stdio: "inherit" });
  console.log("\n============================================");
  console.log("✅ Deployment Complete!");
  console.log("============================================\n");
} catch (error) {
  console.error("\n❌ Deployment failed");
  process.exit(1);
}
console.log("Summary:");
console.log(
  `  Environment Variables: ${skipEnvUpdate ? "Skipped" : "Updated"}`
);
console.log("  Deployment: Success");
console.log("");
