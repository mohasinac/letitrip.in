const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const envFile = path.join(__dirname, "..", ".env.local");

if (!fs.existsSync(envFile)) {
  console.error("\x1b[31m.env.local file not found\x1b[0m");
  process.exit(1);
}

const envContent = fs.readFileSync(envFile, "utf-8");
const match = envContent.match(/SONAR_TOKEN=(.+)/);

if (!match) {
  console.error("\x1b[31mSONAR_TOKEN not found in .env.local\x1b[0m");
  process.exit(1);
}

process.env.SONAR_TOKEN = match[1].trim();
console.log("\x1b[32mSONAR_TOKEN loaded from .env.local\x1b[0m");
console.log("\x1b[36mRunning SonarCloud scan...\x1b[0m\n");

try {
  execSync("npx sonar-scanner", { stdio: "inherit" });
} catch (error) {
  process.exit(error.status || 1);
}
