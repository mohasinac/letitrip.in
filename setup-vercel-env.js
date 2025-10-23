#!/usr/bin/env node

/**
 * Vercel Environment Variables Setup Script
 * This script helps you add Firebase Admin credentials to Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel Environment Variables Setup\n');

// Read .env.local file
function loadEnvLocal() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found');
    return {};
  }

  const envFile = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envFile.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
      }
    }
  });
  
  return env;
}

const env = loadEnvLocal();

// Environment variables to add to Vercel
const vercelEnvVars = [
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL', 
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_SITE_NAME'
];

console.log('📋 Environment Variables for Vercel:\n');

vercelEnvVars.forEach(varName => {
  const value = env[varName];
  if (value) {
    console.log(`✅ ${varName}=${value.length > 50 ? '[LONG_VALUE]' : value}`);
  } else {
    console.log(`❌ ${varName}=MISSING`);
  }
});

console.log('\n🔧 Manual Setup Instructions:');
console.log('1. Go to: https://vercel.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to Settings → Environment Variables');
console.log('4. Add each variable listed above\n');

console.log('⚠️  IMPORTANT for Production URLs:');
console.log('   Update these values for production:');
console.log(`   NEXT_PUBLIC_API_URL=https://your-production-url.vercel.app/api`);
console.log(`   NEXT_PUBLIC_SITE_URL=https://your-production-url.vercel.app\n`);

// Create a Vercel CLI command file
const cliCommands = vercelEnvVars
  .filter(varName => env[varName])
  .map(varName => {
    const value = env[varName].replace(/"/g, '\\"');
    return `vercel env add ${varName} production`;
  })
  .join('\n');

fs.writeFileSync('setup-vercel-env.txt', `# Copy and paste these commands in your terminal:\n\n${cliCommands}\n\n# Then enter the corresponding values when prompted.`);

console.log('📄 Created setup-vercel-env.txt with CLI commands');
console.log('💡 You can also use Vercel CLI: vercel env add VARIABLE_NAME production');

console.log('\n🚀 Ready to deploy after setting up environment variables!');
console.log('   Run: vercel --prod');
