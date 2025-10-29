#!/usr/bin/env node

/**
 * Verification Script for JWT Payload Removal & Guest Persistence
 * Run this script to verify all changes are correctly implemented
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying JWT Payload Removal & Guest Persistence Implementation...\n');

const checks = [];
let passCount = 0;
let failCount = 0;

// Helper function to check file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

// Helper function to check file contains string
function fileContains(filePath, searchString) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.includes(searchString);
  } catch {
    return false;
  }
}

// Helper function to check file does NOT contain string
function fileDoesNotContain(filePath, searchString) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return !content.includes(searchString);
  } catch {
    return false;
  }
}

// Check 1: JWT Payload updated
checks.push({
  name: 'JWT Payload removed email field',
  path: 'src/lib/auth/jwt.ts',
  test: () => {
    const file = 'src/lib/auth/jwt.ts';
    return fileExists(file) && 
           fileDoesNotContain(file, 'email: string;') &&
           fileContains(file, 'userId: string;') &&
           fileContains(file, "role: 'admin' | 'seller' | 'user';");
  }
});

// Check 2: Cookie Storage has new methods
checks.push({
  name: 'Cookie Storage has guest session methods',
  path: 'src/lib/storage/cookieStorage.ts',
  test: () => {
    const file = 'src/lib/storage/cookieStorage.ts';
    return fileExists(file) &&
           fileContains(file, 'setGuestSession') &&
           fileContains(file, 'getGuestSession') &&
           fileContains(file, 'setLastVisitedPage') &&
           fileContains(file, 'getLastVisitedPage');
  }
});

// Check 3: Cart Context updated
checks.push({
  name: 'Cart Context syncs guest session',
  path: 'src/contexts/CartContext.tsx',
  test: () => {
    const file = 'src/contexts/CartContext.tsx';
    return fileExists(file) &&
           fileContains(file, 'getGuestSession') &&
           fileContains(file, '/user/sync-session');
  }
});

// Check 4: Auth Context imports cookieStorage
checks.push({
  name: 'Auth Context imports cookieStorage',
  path: 'src/contexts/AuthContext.tsx',
  test: () => {
    const file = 'src/contexts/AuthContext.tsx';
    return fileExists(file) &&
           fileContains(file, 'from "@/lib/storage/cookieStorage"') &&
           fileContains(file, 'cookieStorage.getLastVisitedPage');
  }
});

// Check 5: Sync session API route exists
checks.push({
  name: 'Sync session API route created',
  path: 'src/app/api/user/sync-session/route.ts',
  test: () => {
    const file = 'src/app/api/user/sync-session/route.ts';
    return fileExists(file) &&
           fileContains(file, 'createUserHandler') &&
           fileContains(file, 'sessionData');
  }
});

// Check 6: Page tracking hook exists
checks.push({
  name: 'Page tracking hook created',
  path: 'src/hooks/usePageTracking.ts',
  test: () => {
    const file = 'src/hooks/usePageTracking.ts';
    return fileExists(file) &&
           fileContains(file, 'usePageTracking') &&
           fileContains(file, 'setLastVisitedPage');
  }
});

// Check 7: Demo page exists
checks.push({
  name: 'Guest persistence demo page created',
  path: 'src/app/(dev)/guest-persistence-demo/page.tsx',
  test: () => {
    const file = 'src/app/(dev)/guest-persistence-demo/page.tsx';
    return fileExists(file) &&
           fileContains(file, 'Guest Session Persistence Demo');
  }
});

// Check 8: Auth service updated token generation
checks.push({
  name: 'Auth Service generates minimal JWT',
  path: 'src/lib/api/services/auth.service.ts',
  test: () => {
    const file = 'src/lib/api/services/auth.service.ts';
    return fileExists(file) &&
           fileDoesNotContain(file, 'email: userData.email,') &&
           fileContains(file, 'userId:') &&
           fileContains(file, 'role:');
  }
});

// Check 9: Documentation exists
checks.push({
  name: 'Feature documentation created',
  path: 'docs/features/JWT_REMOVAL_AND_GUEST_PERSISTENCE.md',
  test: () => fileExists('docs/features/JWT_REMOVAL_AND_GUEST_PERSISTENCE.md')
});

checks.push({
  name: 'Migration guide created',
  path: 'docs/features/JWT_PAYLOAD_MIGRATION_GUIDE.md',
  test: () => fileExists('docs/features/JWT_PAYLOAD_MIGRATION_GUIDE.md')
});

checks.push({
  name: 'Summary document created',
  path: 'docs/features/SUMMARY_JWT_AND_GUEST_PERSISTENCE.md',
  test: () => fileExists('docs/features/SUMMARY_JWT_AND_GUEST_PERSISTENCE.md')
});

// Run all checks
console.log('Running checks...\n');

checks.forEach((check, index) => {
  const result = check.test();
  const status = result ? '✅' : '❌';
  const resultText = result ? 'PASS' : 'FAIL';
  
  console.log(`${status} ${resultText}: ${check.name}`);
  if (!result && check.path) {
    console.log(`   Path: ${check.path}`);
  }
  
  if (result) passCount++;
  else failCount++;
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`Total checks: ${checks.length}`);
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log('='.repeat(60));

if (failCount === 0) {
  console.log('\n🎉 All checks passed! Implementation verified successfully.\n');
  console.log('Next steps:');
  console.log('1. Run TypeScript compilation: npm run build');
  console.log('2. Test the application: npm run dev');
  console.log('3. Visit demo page: /guest-persistence-demo');
  console.log('4. Test guest cart persistence');
  console.log('5. Test login redirect to last page');
  process.exit(0);
} else {
  console.log('\n⚠️  Some checks failed. Please review and fix.\n');
  process.exit(1);
}
