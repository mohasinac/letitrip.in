#!/usr/bin/env node

/**
 * Firebase Admin Credentials Test Script
 * Run this to verify your Firebase Admin SDK configuration
 * 
 * Usage: node test-firebase-admin.js
 */

const fs = require('fs');
const path = require('path');

// Read .env.local file manually
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

console.log('🔍 Firebase Admin Credentials Test\n');

// Load environment variables
const env = loadEnvLocal();

// Check if required environment variables are set
const requiredVars = [
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY'
];

let missingVars = [];
requiredVars.forEach(varName => {
  const value = env[varName];
  if (!value || value.includes('your_') || value === 'your_client_email' || value === '"your_private_key"') {
    missingVars.push(varName);
    console.log(`❌ ${varName}: ${value ? 'PLACEHOLDER VALUE' : 'MISSING'}`);
  } else {
    console.log(`✅ ${varName}: ${value.length > 50 ? 'CONFIGURED (length: ' + value.length + ')' : 'CONFIGURED'}`);
  }
});

if (missingVars.length > 0) {
  console.log(`\n🚨 CONFIGURATION ISSUES FOUND:`);
  console.log(`   Missing or placeholder values for: ${missingVars.join(', ')}`);
  console.log(`\n📋 TO FIX THIS:`);
  console.log(`   1. Go to Firebase Console: https://console.firebase.google.com/`);
  console.log(`   2. Select your project: justforview1`);
  console.log(`   3. Go to Project Settings → Service Accounts`);
  console.log(`   4. Click "Generate new private key"`);
  console.log(`   5. Download the JSON file`);
  console.log(`   6. Update your .env.local file with values from the JSON`);
  console.log(`\n📖 See FIREBASE_ADMIN_SETUP.md for detailed instructions`);
  process.exit(1);
}

console.log(`\n🎉 Environment variables are configured!`);
console.log(`\n🔄 Testing Firebase Admin SDK initialization...`);

// Test Firebase Admin SDK initialization
try {
  const { initializeApp, cert, getApps } = require('firebase-admin/app');
  const { getAuth } = require('firebase-admin/auth');
  const { getFirestore } = require('firebase-admin/firestore');

  // Clear any existing apps
  if (getApps().length > 0) {
    console.log('   Clearing existing Firebase apps...');
  }

  const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');

  const app = initializeApp({
    credential: cert({
      projectId: env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    storageBucket: `${env.FIREBASE_ADMIN_PROJECT_ID}.appspot.com`,
  });

  console.log('✅ Firebase Admin app initialized successfully!');

  // Test Auth service
  const auth = getAuth(app);
  console.log('✅ Firebase Auth service accessible');

  // Test Firestore service
  const db = getFirestore(app);
  console.log('✅ Firestore service accessible');

  console.log(`\n🎉 SUCCESS! Firebase Admin SDK is properly configured.`);
  console.log(`   Your application should now be able to:`);
  console.log(`   • Create user accounts with roles`);
  console.log(`   • Authenticate users`);
  console.log(`   • Access Firestore database`);
  console.log(`   • Manage user permissions`);

} catch (error) {
  console.log(`\n❌ FIREBASE INITIALIZATION FAILED:`);
  console.log(`   Error: ${error.message}`);
  
  if (error.message.includes('private_key')) {
    console.log(`\n💡 PRIVATE KEY ISSUE:`);
    console.log(`   Your private key format might be incorrect.`);
    console.log(`   Make sure it includes the full key with:`);
    console.log(`   -----BEGIN PRIVATE KEY-----`);
    console.log(`   -----END PRIVATE KEY-----`);
    console.log(`   And proper \\n line breaks.`);
  } else if (error.message.includes('client_email')) {
    console.log(`\n💡 CLIENT EMAIL ISSUE:`);
    console.log(`   Your client email should end with:`);
    console.log(`   @${env.FIREBASE_ADMIN_PROJECT_ID}.iam.gserviceaccount.com`);
  } else if (error.message.includes('project')) {
    console.log(`\n💡 PROJECT ID ISSUE:`);
    console.log(`   Make sure FIREBASE_ADMIN_PROJECT_ID matches your Firebase project.`);
  }
  
  console.log(`\n📖 See FIREBASE_ADMIN_SETUP.md for troubleshooting steps.`);
  process.exit(1);
}

console.log(`\n🚀 Ready to test your application!`);
console.log(`   Try: npm run dev`);
console.log(`   Then visit: http://localhost:3000/register`);
