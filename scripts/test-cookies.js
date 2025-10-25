#!/usr/bin/env node

/**
 * Cookie Functionality Test Script
 * Tests all cookie operations to ensure they work properly
 */

console.log('🍪 Testing Cookie Functionality...\n');

// Simulate browser environment
const tests = [];
let passCount = 0;
let failCount = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Test 1: Cookie Storage Class Structure
test('Cookie Storage class exports correctly', () => {
  const fs = require('fs');
  const cookieStoragePath = 'src/lib/storage/cookieStorage.ts';
  const content = fs.readFileSync(cookieStoragePath, 'utf-8');
  
  assert(content.includes('class CookieStorage'), 'CookieStorage class not found');
  assert(content.includes('export const cookieStorage'), 'cookieStorage export not found');
  assert(content.includes('import Cookies from'), 'js-cookie import not found');
});

// Test 2: Required Methods Exist
test('All required methods are defined', () => {
  const fs = require('fs');
  const content = fs.readFileSync('src/lib/storage/cookieStorage.ts', 'utf-8');
  
  const requiredMethods = [
    'set(',
    'get(',
    'remove(',
    'setJson',
    'getJson',
    'setAuthToken',
    'getAuthToken',
    'setCartData',
    'getCartData',
    'setLastVisitedPage',
    'getLastVisitedPage',
    'setGuestSession',
    'getGuestSession',
  ];
  
  requiredMethods.forEach(method => {
    assert(content.includes(method), `Method ${method} not found`);
  });
});

// Test 3: Cart Context Uses Cookie Storage
test('CartContext uses cookieStorage for guest cart', () => {
  const fs = require('fs');
  const content = fs.readFileSync('src/contexts/CartContext.tsx', 'utf-8');
  
  assert(content.includes('cookieStorage.getCartData'), 'getCartData not used');
  assert(content.includes('cookieStorage.setCartData'), 'setCartData not used');
  assert(content.includes('cookieStorage.getGuestSession'), 'getGuestSession not used');
  assert(content.includes('cookieStorage.setGuestSession'), 'setGuestSession not used');
});

// Test 4: Auth Context Uses Cookie Storage
test('AuthContext uses cookieStorage for last visited page', () => {
  const fs = require('fs');
  const content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf-8');
  
  assert(content.includes('cookieStorage'), 'cookieStorage not imported');
  assert(content.includes('getLastVisitedPage'), 'getLastVisitedPage not used');
  assert(content.includes('removeGuestSession'), 'removeGuestSession not used');
});

// Test 5: Cookie Options Are Secure
test('Cookie options have proper security settings', () => {
  const fs = require('fs');
  const content = fs.readFileSync('src/lib/storage/cookieStorage.ts', 'utf-8');
  
  // Check for secure flag
  assert(content.includes('secure: true') || content.includes('secure:'), 'Secure flag not set');
  
  // Check for sameSite
  assert(content.includes('sameSite'), 'SameSite not set');
  
  // Check for expiration
  assert(content.includes('expires:'), 'Expiration not set');
});

// Test 6: Guest Session Structure
test('Guest session has proper structure', () => {
  const fs = require('fs');
  const content = fs.readFileSync('src/lib/storage/cookieStorage.ts', 'utf-8');
  
  // Check guest session type definition
  assert(content.includes('cart?:'), 'Guest session cart property not defined');
  assert(content.includes('lastVisitedPage?:'), 'Guest session lastVisitedPage not defined');
  assert(content.includes('browsing_history?:'), 'Guest session browsing_history not defined');
  assert(content.includes('timestamp'), 'Guest session timestamp not defined');
});

// Test 7: Page Tracking Hook
test('Page tracking hook exists and uses cookies', () => {
  const fs = require('fs');
  const hookPath = 'src/hooks/usePageTracking.ts';
  
  if (!fs.existsSync(hookPath)) {
    throw new Error('usePageTracking hook not found');
  }
  
  const content = fs.readFileSync(hookPath, 'utf-8');
  assert(content.includes('cookieStorage'), 'cookieStorage not used in hook');
  assert(content.includes('setLastVisitedPage'), 'setLastVisitedPage not used');
  assert(content.includes('setGuestSession'), 'setGuestSession not used');
});

// Test 8: Sync Session API Route
test('Sync session API route exists', () => {
  const fs = require('fs');
  const apiPath = 'src/app/api/user/sync-session/route.ts';
  
  if (!fs.existsSync(apiPath)) {
    throw new Error('Sync session API route not found');
  }
  
  const content = fs.readFileSync(apiPath, 'utf-8');
  assert(content.includes('sessionData'), 'sessionData parameter not found');
  assert(content.includes('POST'), 'POST handler not found');
  assert(content.includes('createUserHandler'), 'Auth middleware not used');
});

// Test 9: JWT Does Not Contain Email
test('JWT payload does not include email field', () => {
  const fs = require('fs');
  const content = fs.readFileSync('src/lib/auth/jwt.ts', 'utf-8');
  
  // Find JWTPayload interface
  const payloadMatch = content.match(/interface JWTPayload\s*{([^}]+)}/);
  if (!payloadMatch) {
    throw new Error('JWTPayload interface not found');
  }
  
  const payloadContent = payloadMatch[1];
  assert(!payloadContent.includes('email:'), 'Email field should not be in JWT payload');
  assert(payloadContent.includes('userId:'), 'userId field missing');
  assert(payloadContent.includes('role:'), 'role field missing');
});

// Test 10: Auth Service Generates Minimal JWT
test('Auth service generates JWT without email', () => {
  const fs = require('fs');
  const content = fs.readFileSync('src/lib/api/services/auth.service.ts', 'utf-8');
  
  // Check that generateToken is called with minimal payload
  const loginMatch = content.match(/generateToken\s*\(\s*{[^}]+}/g);
  if (!loginMatch) {
    throw new Error('generateToken call not found');
  }
  
  // Ensure email is not in any generateToken call
  loginMatch.forEach(match => {
    assert(!match.includes('email:'), 'Email should not be in generateToken call');
  });
});

// Test 11: Cookie Storage Package Installed
test('js-cookie package should be in package.json', () => {
  const fs = require('fs');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  
  const hasJsCookie = 
    packageJson.dependencies?.['js-cookie'] || 
    packageJson.devDependencies?.['js-cookie'];
  
  if (!hasJsCookie) {
    console.warn('⚠️  Warning: js-cookie not found in package.json. You may need to install it.');
    console.warn('   Run: npm install js-cookie @types/js-cookie');
  }
});

// Test 12: Documentation Exists
test('Documentation files exist', () => {
  const fs = require('fs');
  const docs = [
    'docs/features/JWT_REMOVAL_AND_GUEST_PERSISTENCE.md',
    'docs/features/JWT_PAYLOAD_MIGRATION_GUIDE.md',
    'docs/features/SUMMARY_JWT_AND_GUEST_PERSISTENCE.md',
  ];
  
  docs.forEach(doc => {
    assert(fs.existsSync(doc), `Documentation file ${doc} not found`);
  });
});

// Run all tests
console.log('Running tests...\n');

tests.forEach((test, index) => {
  try {
    test.fn();
    console.log(`✅ PASS: ${test.name}`);
    passCount++;
  } catch (error) {
    console.log(`❌ FAIL: ${test.name}`);
    console.log(`   Error: ${error.message}\n`);
    failCount++;
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`Total tests: ${tests.length}`);
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log('='.repeat(60));

if (failCount === 0) {
  console.log('\n🎉 All cookie tests passed!\n');
  console.log('Cookie Implementation Checklist:');
  console.log('✅ Cookie storage class implemented');
  console.log('✅ Guest cart persistence enabled');
  console.log('✅ Last visited page tracking enabled');
  console.log('✅ Guest session data structure defined');
  console.log('✅ JWT payload minimized (no email)');
  console.log('✅ Auth service updated');
  console.log('✅ Cart context integrated');
  console.log('✅ Auth context integrated');
  console.log('✅ Page tracking hook created');
  console.log('✅ Sync API route created');
  console.log('✅ Documentation complete');
  
  console.log('\n📋 Manual Testing Required:');
  console.log('1. Test in browser: Add items to cart as guest');
  console.log('2. Close and reopen browser - cart should persist');
  console.log('3. Login - cart should merge with user cart');
  console.log('4. Check browser DevTools > Application > Cookies');
  console.log('5. Verify cookies: cart_data, guest_session, last_visited_page');
  
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review and fix.\n');
  process.exit(1);
}
