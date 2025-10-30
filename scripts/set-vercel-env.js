const { execSync } = require("child_process");
const fs = require("fs");

// Read the vercel.json file
const vercelConfig = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
const envVars = vercelConfig.env;

console.log("Setting Vercel environment variables...");

// Function to execute command and handle errors
function runCommand(command) {
  try {
    const result = execSync(command, { stdio: "pipe", encoding: "utf8" });
    return result;
  } catch (error) {
    console.error(`Error executing: ${command}`);
    console.error(error.message);
    return null;
  }
}

// Set each environment variable
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`Setting ${key}...`);

  // Escape the value properly for command line
  const escapedValue = value.replace(/"/g, '\\"').replace(/\n/g, "\\n");

  // Try to add the environment variable first
  let command = `echo "${escapedValue}" | npx vercel env add ${key} production`;
  let result = runCommand(command);

  if (result === null) {
    // If add failed, try to remove and add again
    console.log(`  ${key} might already exist, trying to update...`);

    // Remove existing variable
    const removeResult = runCommand(
      `npx vercel env rm ${key} production --yes`,
    );

    if (removeResult !== null) {
      // Try adding again after removal
      result = runCommand(command);
      if (result !== null) {
        console.log(`✅ ${key} updated successfully`);
      } else {
        console.log(`❌ Failed to update ${key} after removal`);
      }
    } else {
      console.log(`❌ Failed to remove existing ${key}`);
    }
  } else {
    console.log(`✅ ${key} added successfully`);
  }
});

console.log("Finished setting environment variables.");
