#!/usr/bin/env node

/**
 * Vercel Environment Variables Setup Script
 * Sets required environment variables for production deployment
 */

const { execSync } = require('child_process');

// Generate a secure JWT secret
function generateJWTSecret() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

const envVars = [
  {
    key: 'JWT_SECRET',
    value: generateJWTSecret(),
    description: 'JWT secret for authentication'
  },
  {
    key: 'JWT_EXPIRES_IN',
    value: '7d',
    description: 'JWT expiration time'
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    value: 'AIzaSyCL2eA6_wFSMcyel9pxntnVOm7SFh2iWTM',
    description: 'Firebase API Key (public)'
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    value: 'justforview1.firebaseapp.com',
    description: 'Firebase Auth Domain (public)'
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    value: 'justforview1',
    description: 'Firebase Project ID (public)'
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    value: 'justforview1.firebasestorage.app',
    description: 'Firebase Storage Bucket (public)'
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    value: '995821948299',
    description: 'Firebase Messaging Sender ID (public)'
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_APP_ID',
    value: '1:995821948299:web:38d1decb11eca69c7d738e',
    description: 'Firebase App ID (public)'
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
    value: 'G-4BLN02DGVX',
    description: 'Firebase Measurement ID (public)'
  },
  {
    key: 'NEXT_PUBLIC_API_URL',
    value: '/api',
    description: 'API URL for the application'
  },
  {
    key: 'NEXT_PUBLIC_SITE_URL',
    value: 'https://justforview-in.vercel.app',
    description: 'Production site URL'
  },
  {
    key: 'NEXT_PUBLIC_SITE_NAME',
    value: 'JustForView Store',
    description: 'Site name'
  }
];

console.log('🔧 Setting up Vercel environment variables...');
console.log('');

try {
  // Set each environment variable
  envVars.forEach(({ key, value, description }) => {
    try {
      console.log(`Setting ${key}...`);
      execSync(`vercel env add ${key} production`, {
        input: value,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      console.log(`✅ ${key} set successfully`);
    } catch (error) {
      console.log(`⚠️  ${key} might already exist or error occurred`);
    }
  });

  console.log('');
  console.log('🎉 Environment variables setup completed!');
  console.log('');
  console.log('You can now deploy with: vercel --prod');
  console.log('');

  // Display the generated JWT secret for reference
  console.log('📝 Generated JWT Secret (save this securely):');
  console.log(envVars.find(v => v.key === 'JWT_SECRET').value);
  console.log('');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  console.log('');
  console.log('Manual setup instructions:');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings > Environment Variables');
  console.log('4. Add the following variables:');
  console.log('');
  
  envVars.forEach(({ key, value, description }) => {
    console.log(`${key}=${value}`);
  });
}
