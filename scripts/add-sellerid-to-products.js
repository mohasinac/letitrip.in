/**
 * Add sellerId to products that don't have one
 * Assigns them to the first seller found in the database
 */

const admin = require('firebase-admin');

// Check if already initialized
if (!admin.apps.length) {
  // Initialize with environment variables
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  if (!privateKey || !process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
    console.error('ERROR: Firebase Admin credentials not found in environment variables.');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

const db = admin.firestore();

async function addSellerIdToProducts() {
  try {
    console.log('Adding sellerId to products...\n');

    // Get all products
    const productsSnapshot = await db.collection('products').get();
    console.log(`Total products in database: ${productsSnapshot.docs.length}`);

    // Find products without sellerId
    const productsToFix = [];
    productsSnapshot.docs.forEach((doc) => {
      const product = doc.data();
      if (!product.sellerId) {
        productsToFix.push({
          id: doc.id,
          name: product.name,
          currentSellerId: product.sellerId,
        });
      }
    });

    console.log(`Products needing sellerId: ${productsToFix.length}\n`);

    if (productsToFix.length === 0) {
      console.log('No products need fixing. All products have sellerId.');
      return;
    }

    // Get first seller from database
    const sellersSnapshot = await db.collection('users').where('role', '==', 'seller').limit(1).get();
    
    let newSellerId, newSellerName;
    
    if (sellersSnapshot.empty) {
      // If no seller, get first admin
      const adminsSnapshot = await db.collection('users').where('role', '==', 'admin').limit(1).get();
      
      if (adminsSnapshot.empty) {
        console.error('ERROR: No sellers or admins found in database. Cannot fix products.');
        return;
      }

      const adminDoc = adminsSnapshot.docs[0];
      const adminData = adminDoc.data();
      newSellerId = adminDoc.id;
      newSellerName = adminData.name || 'Admin';

      console.log(`Using admin as seller:`);
      console.log(`  ID: ${newSellerId}`);
      console.log(`  Name: ${newSellerName}\n`);
    } else {
      const sellerDoc = sellersSnapshot.docs[0];
      const sellerData = sellerDoc.data();
      newSellerId = sellerDoc.id;
      newSellerName = sellerData.name || 'Seller';

      console.log(`Assigning products to seller:`);
      console.log(`  ID: ${newSellerId}`);
      console.log(`  Name: ${newSellerName}\n`);
    }

    // Update products
    const batch = db.batch();
    let count = 0;

    for (const product of productsToFix) {
      const productRef = db.collection('products').doc(product.id);
      batch.update(productRef, {
        sellerId: newSellerId,
        sellerName: newSellerName,
        updatedAt: new Date(),
      });

      console.log(`  Updating product: ${product.name} (${product.id})`);
      count++;

      // Firestore batch limit is 500 operations
      if (count % 500 === 0) {
        await batch.commit();
        console.log(`  Committed batch of ${count} products\n`);
      }
    }

    // Commit remaining products
    if (count % 500 !== 0) {
      await batch.commit();
      console.log(`  Committed final batch\n`);
    }

    console.log(`Total products updated: ${count}`);
    console.log('\n✅ Product sellerId update completed successfully!');

  } catch (error) {
    console.error('Error adding sellerId to products:', error);
  } finally {
    process.exit(0);
  }
}

addSellerIdToProducts();
