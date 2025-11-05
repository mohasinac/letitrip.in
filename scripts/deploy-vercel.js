#!/usr/bin/env node

/**
 * Deploy to Vercel with Environment Variables
 * This script syncs environment variables and deploys to Vercel
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  production: false,
  preview: false,
  envFile: '.env.local',
  skipEnvSync: false,
  skipBuild: false
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--production':
    case '-p':
      options.production = true;
      break;
    case '--preview':
      options.preview = true;
      break;
    case '--env-file':
      options.envFile = args[++i];
      break;
    case '--skip-env-sync':
      options.skipEnvSync = true;
      break;
    case '--skip-build':
      options.skipBuild = true;
      break;
    case '--help':
      console.log(`
Usage: node deploy-vercel.js [options]

Options:
  -p, --production      Deploy to production
  --preview             Deploy to preview
  --env-file <file>     Environment file to use (default: .env.local)
  --skip-env-sync       Skip environment variable sync
  --skip-build          Skip build step
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
  colorLog('  Vercel Deployment Script', 'cyan');
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

  // Step 1: Sync environment variables
  if (!options.skipEnvSync) {
    console.log('');
    colorLog('[1/3] Syncing environment variables...', 'cyan');

    if (fs.existsSync(options.envFile)) {
      colorLog('Do you want to sync environment variables?', 'yellow');
      const syncConfirm = await prompt('(yes/no): ');

      if (syncConfirm.toLowerCase() === 'yes' || syncConfirm.toLowerCase() === 'y') {
        const syncArgs = ['node', path.join(__dirname, 'sync-env-to-vercel.js'), '--env-file', options.envFile];

        if (options.production) {
          syncArgs.push('--environment', 'production');
        } else if (options.preview) {
          syncArgs.push('--preview');
        }

        try {
          execSync(syncArgs.join(' '), { stdio: 'inherit' });
        } catch (error) {
          colorLog('Environment sync failed!', 'red');
          process.exit(1);
        }
      } else {
        colorLog('Skipping environment sync...', 'yellow');
      }
    } else {
      colorLog(`No ${options.envFile} found. Skipping environment sync...`, 'yellow');
    }
  } else {
    console.log('');
    colorLog('Skipping environment sync...', 'yellow');
  }

  // Step 2: Build project
  if (!options.skipBuild) {
    console.log('');
    colorLog('[2/3] Building project...', 'cyan');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      colorLog('Build completed successfully!', 'green');
    } catch (error) {
      colorLog('Build failed!', 'red');
      process.exit(1);
    }
  } else {
    console.log('');
    colorLog('Skipping build...', 'yellow');
  }

  // Step 3: Deploy to Vercel
  console.log('');
  colorLog('[3/3] Deploying to Vercel...', 'cyan');

  const deployArgs = ['vercel'];

  if (options.production) {
    colorLog('Deploying to PRODUCTION...', 'yellow');
    deployArgs.push('--prod');
  } else {
    colorLog('Deploying to PREVIEW...', 'cyan');
  }

  console.log('');
  colorLog(`Executing: ${deployArgs.join(' ')}`, 'cyan');

  try {
    execSync(deployArgs.join(' '), { stdio: 'inherit' });
    console.log('');
    colorLog('=================================', 'green');
    colorLog('  ✓ Deployment Successful!', 'green');
    colorLog('=================================', 'green');
  } catch (error) {
    console.log('');
    colorLog('Deployment failed!', 'red');
    process.exit(1);
  }
}

// Run main function
main().catch((error) => {
  colorLog(`Error: ${error.message}`, 'red');
  process.exit(1);
});
