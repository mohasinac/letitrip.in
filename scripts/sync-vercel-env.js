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

class ProgressBar {
  constructor(total, width = 30) {
    this.total = total;
    this.current = 0;
    this.width = width;
    this.startTime = Date.now();
    this.lastMessage = '';
  }

  update(current, message = '', status = '') {
    this.current = current;
    const percentage = Math.round((current / this.total) * 100);
    const filled = Math.round((current / this.total) * this.width);
    const empty = this.width - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    
    // Estimate time remaining
    const rate = current / (Date.now() - this.startTime) * 1000;
    const remaining = rate > 0 ? Math.round((this.total - current) / rate) : 0;
    const eta = remaining > 0 ? ` ETA: ${remaining}s` : '';
    
    // Status emoji based on action
    let statusEmoji = '⚡';
    if (message.includes('Adding')) statusEmoji = '➕';
    else if (message.includes('Updating')) statusEmoji = '🔄';
    else if (message.includes('Skipping')) statusEmoji = '⏭️';
    
    // Clear the line and write the progress bar
    process.stdout.write('\r');
    process.stdout.write('\x1b[K'); // Clear to end of line
    
    const progressText = colorize(`[${bar}] ${percentage}% (${current}/${this.total})`, 'cyan');
    const timeText = colorize(`${elapsed}s${eta}`, 'yellow');
    const statusText = message ? colorize(`${statusEmoji} ${message}`, 'blue') : '';
    
    process.stdout.write(`${progressText} ${timeText} ${statusText}`);
    
    if (current === this.total) {
      process.stdout.write('\n');
    }
  }

  finish(message = 'Complete') {
    this.update(this.total, message);
  }
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

class Spinner {
  constructor(message = 'Loading...') {
    this.message = message;
    this.frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.current = 0;
    this.interval = null;
  }

  start() {
    this.interval = setInterval(() => {
      process.stdout.write('\r');
      process.stdout.write('\x1b[K'); // Clear line
      process.stdout.write(colorize(`${this.frames[this.current]} ${this.message}`, 'cyan'));
      this.current = (this.current + 1) % this.frames.length;
    }, 80);
  }

  stop(finalMessage = '') {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write('\r');
    process.stdout.write('\x1b[K'); // Clear line
    if (finalMessage) {
      console.log(finalMessage);
    }
  }
}

function getExistingEnvVars() {
  const spinner = new Spinner('Fetching existing environment variables...');
  spinner.start();
  
  try {
    const result = executeCommand('vercel env ls production --json', { silent: true });
    if (result) {
      const envVars = JSON.parse(result);
      spinner.stop(colorize(`✅ Found ${envVars.length} existing environment variables`, 'green'));
      return envVars.reduce((acc, env) => {
        acc[env.key] = env;
        return acc;
      }, {});
    }
  } catch (error) {
    spinner.stop(colorize('⚠️  Could not fetch existing environment variables', 'yellow'));
    log('This might be the first deployment or a permission issue', 'yellow');
  }
  
  return {};
}

function setEnvironmentVariable(key, value, isUpdate = false) {
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
    return true;
  } catch (error) {
    // Error will be handled by the progress bar display
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
  
  // Initialize progress bar
  const progressBar = new ProgressBar(keys.length);
  let processedCount = 0;

  for (const [key, value] of Object.entries(envVars)) {
    processedCount++;
    
    // Skip if value is undefined or null
    if (value === undefined || value === null) {
      progressBar.update(processedCount, `Skipping ${key} (undefined)`);
      results.skipped++;
      continue;
    }

    const stringValue = String(value);
    const exists = existingVars[key];
    
    if (exists) {
      // Check if value has changed
      if (exists.value === stringValue) {
        progressBar.update(processedCount, `Skipping ${key} (no changes)`);
        results.skipped++;
        continue;
      }
      
      // Update existing variable
      progressBar.update(processedCount, `Updating ${key}`);
      if (setEnvironmentVariable(key, stringValue, true)) {
        results.updated++;
      } else {
        results.failed++;
      }
    } else {
      // Add new variable
      progressBar.update(processedCount, `Adding ${key}`);
      if (setEnvironmentVariable(key, stringValue, false)) {
        results.added++;
      } else {
        results.failed++;
      }
    }
  }

  // Finish the progress bar
  progressBar.finish('All variables processed');
  
  // Add a small delay for better visual flow
  console.log('');
  
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
    const spinner = new Spinner('Reading vercel.json configuration...');
    spinner.start();
    
    const config = readVercelConfig();
    
    if (!config.env || Object.keys(config.env).length === 0) {
      spinner.stop(colorize('⚠️  No environment variables found in vercel.json', 'yellow'));
      process.exit(0);
    }
    
    spinner.stop(colorize(`✅ Found ${Object.keys(config.env).length} environment variables in vercel.json`, 'green'));
    
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
