/**
 * Fix orders with default-seller or missing sellerId
 * Assigns them to the first seller found in the database
 */

const admin = require('firebase-admin');

// Check if already initialized
if (!admin.apps.length) {
  // Initialize with environment variables (for Vercel/production)
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  if (!privateKey || !process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
    console.error('ERROR: Firebase Admin credentials not found in environment variables.');
    console.error('Please set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY');
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

async function fixOrderSellerIds() {
  try {
    console.log('Starting order sellerId fix...\n');

    // Get all orders
    const ordersSnapshot = await db.collection('orders').get();
    console.log(`Total orders in database: ${ordersSnapshot.docs.length}`);

    // Find orders with default-seller or missing sellerId
    const ordersToFix = [];
    ordersSnapshot.docs.forEach((doc) => {
      const order = doc.data();
      if (!order.sellerId || order.sellerId === 'default-seller') {
        ordersToFix.push({
          id: doc.id,
          orderNumber: order.orderNumber,
          currentSellerId: order.sellerId,
        });
      }
    });

    console.log(`Orders needing fix: ${ordersToFix.length}\n`);

    if (ordersToFix.length === 0) {
      console.log('No orders need fixing. All orders have valid sellerIds.');
      return;
    }

    // Get first seller from database
    const sellersSnapshot = await db.collection('users').where('role', '==', 'seller').limit(1).get();
    
    if (sellersSnapshot.empty) {
      // If no seller, get first admin
      const adminsSnapshot = await db.collection('users').where('role', '==', 'admin').limit(1).get();
      
      if (adminsSnapshot.empty) {
        console.error('ERROR: No sellers or admins found in database. Cannot fix orders.');
        return;
      }

      const admin = adminsSnapshot.docs[0];
      const adminData = admin.data();
      const newSellerId = admin.id;
      const newSellerName = adminData.name || 'Admin';

      console.log(`Using admin as seller:`);
      console.log(`  ID: ${newSellerId}`);
      console.log(`  Name: ${newSellerName}\n`);

      await updateOrders(ordersToFix, newSellerId, newSellerName);
    } else {
      const seller = sellersSnapshot.docs[0];
      const sellerData = seller.data();
      const newSellerId = seller.id;
      const newSellerName = sellerData.name || 'Seller';

      console.log(`Assigning orders to seller:`);
      console.log(`  ID: ${newSellerId}`);
      console.log(`  Name: ${newSellerName}\n`);

      await updateOrders(ordersToFix, newSellerId, newSellerName);
    }

    console.log('\n✅ Order sellerId fix completed successfully!');

  } catch (error) {
    console.error('Error fixing order sellerIds:', error);
  } finally {
    process.exit(0);
  }
}

async function updateOrders(orders, newSellerId, newSellerName) {
  const batch = db.batch();
  let count = 0;

  for (const order of orders) {
    const orderRef = db.collection('orders').doc(order.id);
    batch.update(orderRef, {
      sellerId: newSellerId,
      sellerName: newSellerName,
      updatedAt: new Date(),
    });

    console.log(`  Updating order ${order.orderNumber} (${order.id})`);
    console.log(`    Old sellerId: ${order.currentSellerId}`);
    console.log(`    New sellerId: ${newSellerId}\n`);

    count++;

    // Firestore batch limit is 500 operations
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`  Committed batch of ${count} orders\n`);
    }
  }

  // Commit remaining orders
  if (count % 500 !== 0) {
    await batch.commit();
    console.log(`  Committed final batch\n`);
  }

  console.log(`Total orders updated: ${count}`);
}

fixOrderSellerIds();
