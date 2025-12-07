#!/usr/bin/env node

// ============================================================
// FIRESTORE INDEX DEPLOYMENT SCRIPT
// ============================================================
// Purpose: Merges modular index files and deploys to Firestore
// Usage: node firestore-indexes/deploy-indexes.js [--dry-run]
// 
// This script:
// 1. Loads all index modules from firestore-indexes/ folder
// 2. Merges indexes and fieldOverrides from all modules
// 3. Writes to firestore.indexes.json
// 4. Optionally deploys via Firebase CLI
// ============================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const INDEXES_DIR = path.join(__dirname);
const OUTPUT_FILE = path.join(__dirname, '..', 'firestore.indexes.json');
const DRY_RUN = process.argv.includes('--dry-run');
const SKIP_DEPLOY = process.argv.includes('--skip-deploy');

// Index module files (order determines comment organization)
const INDEX_MODULES = [
  'products.js',
  'auctions.js',
  'shops.js',
  'orders.js',
  'categories.js',
  'reviews.js',
  'bids.js',
  'favorites.js',
  'users.js',
  'user-activities.js',
  'addresses.js',
  'support-tickets.js',
  'payments.js',
  'riplimit-refunds.js'
];

console.log('🔥 Firestore Index Deployment Script\n');
console.log('═══════════════════════════════════════\n');

// Step 1: Load all index modules
console.log('📂 Loading index modules...\n');
const allIndexes = [];
const allFieldOverrides = [];
let totalIndexCount = 0;
let totalOverrideCount = 0;

INDEX_MODULES.forEach(moduleName => {
  const modulePath = path.join(INDEXES_DIR, moduleName);
  
  if (!fs.existsSync(modulePath)) {
    console.warn(`⚠️  Warning: ${moduleName} not found, skipping...\n`);
    return;
  }

  try {
    const module = require(modulePath);
    const indexCount = module.indexes?.length || 0;
    const overrideCount = module.fieldOverrides?.length || 0;
    
    console.log(`✓ ${moduleName.padEnd(20)} ${indexCount} indexes, ${overrideCount} overrides`);
    
    if (module.indexes) {
      allIndexes.push(...module.indexes);
      totalIndexCount += indexCount;
    }
    
    if (module.fieldOverrides) {
      allFieldOverrides.push(...module.fieldOverrides);
      totalOverrideCount += overrideCount;
    }
  } catch (error) {
    console.error(`✗ Error loading ${moduleName}:`, error.message);
    process.exit(1);
  }
});

console.log('\n───────────────────────────────────────');
console.log(`📊 Total: ${totalIndexCount} indexes, ${totalOverrideCount} field overrides\n`);

// Step 2: Build final configuration
const firestoreConfig = {
  indexes: allIndexes,
  fieldOverrides: allFieldOverrides
};

// Step 3: Write to firestore.indexes.json
console.log('📝 Writing to firestore.indexes.json...\n');

if (DRY_RUN) {
  console.log('🔍 DRY RUN MODE - No files will be modified\n');
  console.log('Generated configuration:');
  console.log(JSON.stringify(firestoreConfig, null, 2).substring(0, 500) + '...\n');
} else {
  try {
    fs.writeFileSync(
      OUTPUT_FILE,
      JSON.stringify(firestoreConfig, null, 2),
      'utf-8'
    );
    console.log(`✓ Successfully wrote ${OUTPUT_FILE}\n`);
  } catch (error) {
    console.error('✗ Error writing firestore.indexes.json:', error.message);
    process.exit(1);
  }
}

// Step 4: Deploy to Firebase (optional)
if (!SKIP_DEPLOY && !DRY_RUN) {
  console.log('🚀 Deploying indexes to Firebase...\n');
  console.log('───────────────────────────────────────\n');
  
  try {
    execSync('firebase deploy --only firestore:indexes', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('\n───────────────────────────────────────');
    console.log('✓ Deployment complete!\n');
  } catch (error) {
    console.error('\n✗ Deployment failed:', error.message);
    console.log('\nℹ️  You can manually deploy with:');
    console.log('   firebase deploy --only firestore:indexes\n');
    process.exit(1);
  }
} else if (SKIP_DEPLOY) {
  console.log('⏭️  Skipping deployment (--skip-deploy flag)\n');
  console.log('ℹ️  To deploy manually, run:');
  console.log('   firebase deploy --only firestore:indexes\n');
} else if (DRY_RUN) {
  console.log('⏭️  Skipping deployment (dry run mode)\n');
}

// Step 5: Summary
console.log('═══════════════════════════════════════\n');
console.log('📋 SUMMARY\n');
console.log(`   Indexes merged:      ${totalIndexCount}`);
console.log(`   Field overrides:     ${totalOverrideCount}`);
console.log(`   Output file:         ${path.relative(process.cwd(), OUTPUT_FILE)}`);
console.log(`   Deployment:          ${DRY_RUN ? 'Skipped (dry run)' : SKIP_DEPLOY ? 'Skipped' : 'Complete'}\n`);

if (!DRY_RUN && !SKIP_DEPLOY) {
  console.log('✅ All done! Your Firestore indexes are now live.\n');
} else {
  console.log('✅ Configuration generated successfully.\n');
}
