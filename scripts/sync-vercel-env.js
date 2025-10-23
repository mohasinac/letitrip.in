#!/usr/bin/env node

/**
 * Vercel Environment Variables Sync Script
 * Reads environment variables from vercel.json and syncs them to Vercel using CLI
 * Supports both adding new variables and updating existing ones
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function log(message, color = 'reset') {
  console.log(colorize(message, color));
}

function readVercelConfig() {
  const configPath = path.join(process.cwd(), 'vercel.json');
  
  if (!fs.existsSync(configPath)) {
    throw new Error('vercel.json not found in the current directory');
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config;
  } catch (error) {
    throw new Error(`Failed to parse vercel.json: ${error.message}`);
  }
}

function executeCommand(command, options = {}) {
  try {
    return execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      ...options
    });
  } catch (error) {
    if (!options.silent) {
      throw error;
    }
    return null;
  }
}

function checkVercelCLI() {
  log('🔍 Checking Vercel CLI installation...', 'blue');
  
  try {
    executeCommand('vercel --version', { silent: true });
    log('✅ Vercel CLI is installed', 'green');
  } catch (error) {
    log('❌ Vercel CLI not found. Please install it first:', 'red');
    log('npm i -g vercel', 'cyan');
    process.exit(1);
  }
}

function checkVercelAuth() {
  log('🔐 Checking Vercel authentication...', 'blue');
  
  try {
    const result = executeCommand('vercel whoami', { silent: true });
    if (result && result.trim()) {
      log(`✅ Authenticated as: ${result.trim()}`, 'green');
      return true;
    }
  } catch (error) {
    // Command failed, user not authenticated
  }
  
  log('❌ Not authenticated with Vercel. Please login first:', 'red');
  log('vercel login', 'cyan');
  process.exit(1);
}

function getExistingEnvVars() {
  log('📋 Fetching existing environment variables...', 'blue');
  
  try {
    const result = executeCommand('vercel env ls production --json', { silent: true });
    if (result) {
      const envVars = JSON.parse(result);
      log(`✅ Found ${envVars.length} existing environment variables`, 'green');
      return envVars.reduce((acc, env) => {
        acc[env.key] = env;
        return acc;
      }, {});
    }
  } catch (error) {
    log('⚠️  Could not fetch existing environment variables', 'yellow');
    log('This might be the first deployment or a permission issue', 'yellow');
  }
  
  return {};
}

function setEnvironmentVariable(key, value, isUpdate = false) {
  const action = isUpdate ? 'Updating' : 'Adding';
  const actionEmoji = isUpdate ? '🔄' : '➕';
  
  log(`${actionEmoji} ${action} ${key}...`, 'blue');
  
  try {
    if (isUpdate) {
      // For updates, we need to remove first, then add
      executeCommand(`vercel env rm ${key} production --yes`, { silent: true });
    }
    
    // Add the environment variable
    // We need to echo the value and pipe it to vercel env add
    const command = process.platform === 'win32' 
      ? `echo ${value} | vercel env add ${key} production`
      : `echo "${value}" | vercel env add ${key} production`;
    
    executeCommand(command, { silent: true });
    
    const symbol = isUpdate ? '🔄' : '✅';
    log(`${symbol} ${key} ${isUpdate ? 'updated' : 'added'} successfully`, 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to ${isUpdate ? 'update' : 'add'} ${key}`, 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

function syncEnvironmentVariables(envVars, existingVars) {
  const results = {
    added: 0,
    updated: 0,
    failed: 0,
    skipped: 0
  };

  const keys = Object.keys(envVars);
  log(`\n🚀 Syncing ${keys.length} environment variables...`, 'bright');
  log('─'.repeat(50), 'cyan');

  for (const [key, value] of Object.entries(envVars)) {
    // Skip if value is undefined or null
    if (value === undefined || value === null) {
      log(`⏭️  Skipping ${key} (undefined value)`, 'yellow');
      results.skipped++;
      continue;
    }

    const stringValue = String(value);
    const exists = existingVars[key];
    
    if (exists) {
      // Check if value has changed
      if (exists.value === stringValue) {
        log(`⏭️  Skipping ${key} (no changes)`, 'yellow');
        results.skipped++;
        continue;
      }
      
      // Update existing variable
      if (setEnvironmentVariable(key, stringValue, true)) {
        results.updated++;
      } else {
        results.failed++;
      }
    } else {
      // Add new variable
      if (setEnvironmentVariable(key, stringValue, false)) {
        results.added++;
      } else {
        results.failed++;
      }
    }
  }

  return results;
}

function displayResults(results) {
  log('\n' + '─'.repeat(50), 'cyan');
  log('📊 Sync Results:', 'bright');
  log(`✅ Added: ${results.added}`, 'green');
  log(`🔄 Updated: ${results.updated}`, 'blue');
  log(`⏭️  Skipped: ${results.skipped}`, 'yellow');
  log(`❌ Failed: ${results.failed}`, 'red');
  
  const total = results.added + results.updated;
  if (total > 0) {
    log(`\n🎉 Successfully synced ${total} environment variables!`, 'green');
    log('Your environment variables are now up to date.', 'green');
  } else if (results.skipped > 0 && results.failed === 0) {
    log('\n✨ All environment variables are already up to date!', 'cyan');
  }
  
  if (results.failed > 0) {
    log(`\n⚠️  ${results.failed} variables failed to sync. Please check the errors above.`, 'yellow');
  }
}

function main() {
  try {
    log(colorize('🚀 Vercel Environment Variables Sync', 'bright'));
    log(colorize('═'.repeat(50), 'cyan'));
    
    // Pre-flight checks
    checkVercelCLI();
    checkVercelAuth();
    
    // Read vercel.json configuration
    log('\n📖 Reading vercel.json configuration...', 'blue');
    const config = readVercelConfig();
    
    if (!config.env || Object.keys(config.env).length === 0) {
      log('⚠️  No environment variables found in vercel.json', 'yellow');
      process.exit(0);
    }
    
    log(`✅ Found ${Object.keys(config.env).length} environment variables in vercel.json`, 'green');
    
    // Get existing environment variables
    const existingVars = getExistingEnvVars();
    
    // Sync environment variables
    const results = syncEnvironmentVariables(config.env, existingVars);
    
    // Display results
    displayResults(results);
    
    // Additional info
    log('\n💡 Next Steps:', 'bright');
    log('• Run your deployment: vercel --prod', 'cyan');
    log('• Check your variables: vercel env ls production', 'cyan');
    log('• View your project: https://vercel.com/dashboard', 'cyan');
    
  } catch (error) {
    log(`\n❌ Script failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  log('\n\n🛑 Process interrupted by user', 'yellow');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log('\n❌ Unhandled promise rejection:', 'red');
  console.error(reason);
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main();
}

module.exports = {
  readVercelConfig,
  syncEnvironmentVariables,
  setEnvironmentVariable
};
