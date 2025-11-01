/**
 * Migration Script: seller_products → products
 * 
 * This script migrates data from seller_products collection to products collection
 * Run this once to unify your product collections
 * 
 * Usage: Set environment variables and run: node scripts/migrate-products.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  console.log('📄 Loading environment variables from .env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  envVars.forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      process.env[key] = value;
    }
  });
} else {
  console.warn('⚠️  .env.local file not found, using system environment variables');
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.error('❌ Missing Firebase Admin credentials');
    console.error('Required environment variables:');
    console.error('- FIREBASE_ADMIN_PROJECT_ID');
    console.error('- FIREBASE_ADMIN_CLIENT_EMAIL');
    console.error('- FIREBASE_ADMIN_PRIVATE_KEY');
    console.error('\nMake sure these are set in your .env.local file or environment');
    process.exit(1);
  }

  console.log('✅ Firebase Admin credentials loaded successfully');
  console.log(`📦 Project ID: ${serviceAccount.projectId}`);
  console.log(`📧 Client Email: ${serviceAccount.clientEmail}\n`);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function migrateProducts() {
  console.log('🚀 Starting migration: seller_products → products\n');

  try {
    // Get all seller_products
    const sellerProductsSnapshot = await db.collection('seller_products').get();
    
    if (sellerProductsSnapshot.empty) {
      console.log('⚠️  No products found in seller_products collection');
      return;
    }

    console.log(`📦 Found ${sellerProductsSnapshot.size} products in seller_products\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    const errors = [];
    const batchSize = 450; // Firestore batch limit is 500
    let currentBatch = db.batch();
    let batchOperations = 0;

    for (let i = 0; i < sellerProductsSnapshot.docs.length; i++) {
      const doc = sellerProductsSnapshot.docs[i];
      const data = doc.data();
      const productId = doc.id;

      try {
        // Progress indicator
        if ((i + 1) % 10 === 0 || i === 0) {
          console.log(`Processing: ${i + 1}/${sellerProductsSnapshot.size} products...`);
        }

        // Check if product already exists in products collection
        const existingProduct = await db.collection('products').doc(productId).get();
        
        if (existingProduct.exists) {
          console.log(`⏭️  Skipping ${data.name || productId} - already exists`);
          skippedCount++;
          continue;
        }

        // Transform the data structure
        const productData = {
          // Basic Info
          name: data.name || '',
          slug: data.seo?.slug || data.slug || '',
          description: data.description || '',
          
          // Seller Info
          sellerId: data.sellerId || '',
          sellerName: data.sellerName || '',
          
          // Category (map categoryId to category)
          category: data.categoryId || data.category || '',
          categoryId: data.categoryId || '',
          
          // Pricing
          price: data.pricing?.price || data.price || 0,
          compareAtPrice: data.pricing?.compareAtPrice || data.compareAtPrice || null,
          costPerItem: data.pricing?.costPerItem || null,
          taxable: data.pricing?.taxable || false,
          
          // Inventory
          quantity: data.inventory?.quantity || data.quantity || 0,
          sku: data.inventory?.sku || data.sku || '',
          barcode: data.inventory?.barcode || '',
          trackQuantity: data.inventory?.trackQuantity !== false,
          
          // Images
          images: data.images || [],
          
          // Status & Visibility
          status: data.status || 'draft',
          featured: data.featured || false,
          
          // SEO
          seo: {
            title: data.seo?.title || data.name,
            description: data.seo?.description || data.description,
            keywords: data.seo?.keywords || [],
            slug: data.seo?.slug || data.slug,
          },
          
          // Metadata
          tags: data.tags || [],
          rating: data.rating || 0,
          reviewCount: data.reviewCount || 0,
          
          // Timestamps
          createdAt: data.createdAt || admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Add to batch
        const productRef = db.collection('products').doc(productId);
        currentBatch.set(productRef, productData);
        batchOperations++;
        
        console.log(`✅ Queued: ${data.name || productId}`);
        migratedCount++;

        // Commit batch every 450 operations (Firestore limit is 500)
        if (batchOperations >= batchSize) {
          console.log(`\n💾 Committing batch of ${batchOperations} operations...`);
          await currentBatch.commit();
          console.log(`✅ Batch committed successfully\n`);
          currentBatch = db.batch();
          batchOperations = 0;
        }

      } catch (error) {
        console.error(`❌ Error processing ${data.name || productId}:`, error.message);
        errors.push({ product: data.name || productId, error: error.message });
      }
    }

    // Commit remaining items
    if (batchOperations > 0) {
      console.log(`\n💾 Committing final batch of ${batchOperations} operations...`);
      await currentBatch.commit();
      console.log(`✅ Final batch committed successfully\n`);
    }

    // Summary
    console.log('\n📊 Migration Summary:');
    console.log('═══════════════════════════════════');
    console.log(`✅ Migrated: ${migratedCount} products`);
    console.log(`⏭️  Skipped: ${skippedCount} products (already exist)`);
    console.log(`❌ Errors: ${errors.length}`);
    console.log('═══════════════════════════════════\n');

    if (errors.length > 0) {
      console.log('❌ Errors encountered:');
      errors.forEach(({ product, error }) => {
        console.log(`   - ${product}: ${error}`);
      });
    }

    console.log('✨ Migration complete!\n');
    console.log('Next steps:');
    console.log('1. Verify products in Firebase Console');
    console.log('2. Test product listing pages');
    console.log('3. Update seller dashboard to use products collection');
    console.log('4. Optionally backup and delete seller_products collection\n');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateProducts()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
