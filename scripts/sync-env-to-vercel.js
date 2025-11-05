#!/usr/bin/env node

/**
 * Sync Environment Variables to Vercel
 * This script reads environment variables from .env.local and syncs them to Vercel
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  envFile: '.env.local',
  environment: 'production',
  preview: false,
  development: false,
  dryRun: false,
  project: ''
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--env-file':
      options.envFile = args[++i];
      break;
    case '--environment':
      options.environment = args[++i];
      break;
    case '--preview':
      options.preview = true;
      break;
    case '--development':
      options.development = true;
      break;
    case '--dry-run':
      options.dryRun = true;
      break;
    case '--project':
      options.project = args[++i];
      break;
    case '--help':
      console.log(`
Usage: node sync-env-to-vercel.js [options]

Options:
  --env-file <file>     Environment file to read (default: .env.local)
  --environment <env>   Target environment (default: production)
  --preview             Sync to preview environment
  --development         Sync to development environment
  --dry-run             Show what would be synced without actually syncing
  --project <name>      Vercel project name/scope
  --help                Show this help message
      `);
      process.exit(0);
  }
}

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check if Vercel CLI is installed
function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Read and parse .env file
function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    colorLog(`Environment file '${filePath}' not found!`, 'red');
    colorLog(`Please create ${filePath} with your environment variables.`, 'yellow');
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const envVars = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const match = trimmedLine.match(/^([^=]+)=(.*)$/);
      if (match) {
        let [, key, value] = match;
        key = key.trim();
        value = value.trim();

        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        envVars.push({ key, value });
      }
    }
  }

  return envVars;
}

// Sync a single environment variable to Vercel
function syncEnvVar(key, value, environment) {
  return new Promise((resolve, reject) => {
    const args = ['env', 'add', key, environment];
    
    if (options.project) {
      args.push('--scope', options.project);
    }

    const vercel = spawn('vercel', args, {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Send the value followed by 'y' for confirmation
    vercel.stdin.write(value + '\n');
    vercel.stdin.write('y\n');
    vercel.stdin.end();

    let output = '';
    let errorOutput = '';

    vercel.stdout.on('data', (data) => {
      output += data.toString();
    });

    vercel.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    vercel.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output });
      } else {
        resolve({ success: false, error: errorOutput || output });
      }
    });

    vercel.on('error', (error) => {
      reject(error);
    });
  });
}

// Prompt user for confirmation
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Main function
async function main() {
  console.log('');
  colorLog('=================================', 'cyan');
  colorLog('  Sync Environment to Vercel', 'cyan');
  colorLog('=================================', 'cyan');
  console.log('');

  // Check if Vercel CLI is installed
  colorLog('Checking for Vercel CLI...', 'cyan');
  if (!checkVercelCLI()) {
    colorLog('Vercel CLI not found. Installing...', 'yellow');
    try {
      execSync('npm install -g vercel', { stdio: 'inherit' });
    } catch (error) {
      colorLog('Failed to install Vercel CLI. Please install it manually: npm install -g vercel', 'red');
      process.exit(1);
    }
  }

  // Check if project is linked
  if (!fs.existsSync('.vercel')) {
    console.log('');
    colorLog('Project not linked to Vercel!', 'yellow');
    colorLog('Run "vercel link" first to link your project.', 'yellow');
    const linkNow = await prompt('Do you want to link now? (yes/no): ');
    
    if (linkNow.toLowerCase() === 'yes' || linkNow.toLowerCase() === 'y') {
      try {
        execSync('vercel link', { stdio: 'inherit' });
      } catch (error) {
        colorLog('Failed to link project. Exiting...', 'red');
        process.exit(1);
      }
    } else {
      colorLog('Cannot sync environment variables without linking. Exiting...', 'red');
      process.exit(1);
    }
  }

  // Read environment variables
  console.log('');
  colorLog(`Reading environment variables from ${options.envFile}...`, 'cyan');
  const envVars = readEnvFile(options.envFile);

  if (envVars.length === 0) {
    colorLog(`No environment variables found in ${options.envFile}`, 'yellow');
    process.exit(1);
  }

  colorLog(`Found ${envVars.length} environment variables`, 'green');

  // Determine target environments
  const targets = [];
  if (options.development) {
    targets.push('development');
  }
  if (options.preview) {
    targets.push('preview');
  }
  if (options.environment === 'production' && !options.development && !options.preview) {
    targets.push('production');
  }
  if (targets.length === 0) {
    targets.push('production');
  }

  console.log('');
  colorLog(`Target environments: ${targets.join(', ')}`, 'cyan');

  // Dry run mode
  if (options.dryRun) {
    console.log('');
    colorLog('=== DRY RUN MODE ===', 'yellow');
    colorLog('The following variables would be synced:', 'cyan');
    envVars.forEach(({ key }) => {
      colorLog(`  - ${key}`, 'cyan');
    });
    console.log('');
    colorLog('To actually sync, run without --dry-run flag', 'yellow');
    process.exit(0);
  }

  // Confirm before proceeding
  console.log('');
  colorLog('This will update environment variables on Vercel.', 'yellow');
  const confirmation = await prompt('Do you want to continue? (yes/no): ');
  
  if (confirmation.toLowerCase() !== 'yes' && confirmation.toLowerCase() !== 'y') {
    colorLog('Operation cancelled.', 'cyan');
    process.exit(0);
  }

  // Sync each environment variable
  let successCount = 0;
  let errorCount = 0;

  for (const { key, value } of envVars) {
    console.log('');
    colorLog(`Syncing: ${key}`, 'cyan');

    for (const target of targets) {
      try {
        const result = await syncEnvVar(key, value, target);
        if (result.success) {
          colorLog(`  ✓ Synced to ${target}`, 'green');
          successCount++;
        } else {
          colorLog(`  ✗ Failed to sync to ${target}`, 'red');
          if (result.error) {
            console.log(`    ${result.error.trim()}`);
          }
          errorCount++;
        }
      } catch (error) {
        colorLog(`  ✗ Error syncing to ${target}: ${error.message}`, 'red');
        errorCount++;
      }
    }
  }

  // Summary
  console.log('');
  colorLog('=== Summary ===', 'cyan');
  colorLog(`Successfully synced: ${successCount}`, 'green');
  colorLog(`Errors: ${errorCount}`, errorCount > 0 ? 'red' : 'green');

  if (errorCount === 0) {
    console.log('');
    colorLog('✓ All environment variables synced successfully!', 'green');
  } else {
    console.log('');
    colorLog('⚠ Some variables failed to sync. Check the output above for details.', 'yellow');
    process.exit(1);
  }
}

// Run main function
main().catch((error) => {
  colorLog(`Error: ${error.message}`, 'red');
  process.exit(1);
});
