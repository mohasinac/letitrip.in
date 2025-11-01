/**
 * Migration Script: Migrate seller-specific collections to common collections
 * 
 * This script migrates data from:
 * - seller_products → products ✅ (already migrated)
 * - seller_orders → orders
 * - seller_coupons → coupons
 * - seller_sales → sales
 * - seller_shipments → shipments
 * - seller_alerts → alerts
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

/**
 * Migrate a collection with progress tracking
 */
async function migrateCollection(sourceCollection, targetCollection) {
  console.log(`\n📦 Starting migration: ${sourceCollection} → ${targetCollection}`);
  
  try {
    // Get all documents from source collection
    const snapshot = await db.collection(sourceCollection).get();
    
    if (snapshot.empty) {
      console.log(`   ℹ️  No documents found in ${sourceCollection}`);
      return { migrated: 0, errors: 0 };
    }

    console.log(`   📊 Found ${snapshot.size} documents to migrate`);
    
    let migrated = 0;
    let errors = 0;
    const batch = db.batch();
    let batchCount = 0;
    
    for (const doc of snapshot.docs) {
      try {
        const data = doc.data();
        const targetRef = db.collection(targetCollection).doc(doc.id);
        
        // Check if document already exists in target
        const existingDoc = await targetRef.get();
        if (existingDoc.exists) {
          console.log(`   ⚠️  Document ${doc.id} already exists in ${targetCollection}, skipping`);
          continue;
        }
        
        // Add to batch
        batch.set(targetRef, data);
        batchCount++;
        
        // Commit batch every 500 operations (Firestore limit)
        if (batchCount >= 500) {
          await batch.commit();
          migrated += batchCount;
          console.log(`   ✅ Migrated ${migrated} documents so far...`);
          batchCount = 0;
        }
      } catch (error) {
        errors++;
        console.error(`   ❌ Error migrating document ${doc.id}:`, error.message);
      }
    }
    
    // Commit remaining documents
    if (batchCount > 0) {
      await batch.commit();
      migrated += batchCount;
    }
    
    console.log(`   ✅ Migration complete: ${migrated} documents migrated, ${errors} errors`);
    return { migrated, errors };
    
  } catch (error) {
    console.error(`   ❌ Migration failed:`, error.message);
    return { migrated: 0, errors: 1 };
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('🚀 Starting collection migration...\n');
  console.log('=' .repeat(60));
  
  const migrations = [
    { source: 'seller_orders', target: 'orders' },
    { source: 'seller_coupons', target: 'coupons' },
    { source: 'seller_sales', target: 'sales' },
    { source: 'seller_shipments', target: 'shipments' },
    { source: 'seller_alerts', target: 'alerts' },
  ];
  
  const results = [];
  
  for (const { source, target } of migrations) {
    const result = await migrateCollection(source, target);
    results.push({ source, target, ...result });
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY\n');
  
  let totalMigrated = 0;
  let totalErrors = 0;
  
  results.forEach(({ source, target, migrated, errors }) => {
    console.log(`${source} → ${target}:`);
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ❌ Errors: ${errors}\n`);
    totalMigrated += migrated;
    totalErrors += errors;
  });
  
  console.log('='.repeat(60));
  console.log(`\n🎉 Total: ${totalMigrated} documents migrated, ${totalErrors} errors`);
  
  if (totalErrors === 0 && totalMigrated > 0) {
    console.log('\n⚠️  NEXT STEPS:');
    console.log('   1. Verify the migrated data in Firebase Console');
    console.log('   2. Test your application thoroughly');
    console.log('   3. Once verified, you can delete the old collections:');
    results.forEach(({ source }) => {
      console.log(`      firebase firestore:delete ${source} --project justforview1 --recursive`);
    });
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
