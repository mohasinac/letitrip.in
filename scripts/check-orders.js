/**
 * Debug script to check orders in the database
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function checkOrders() {
  try {
    console.log('Fetching all orders from database...\n');

    const ordersSnapshot = await db.collection('orders').get();
    
    console.log(`Total orders in database: ${ordersSnapshot.docs.length}\n`);

    if (ordersSnapshot.docs.length === 0) {
      console.log('No orders found in the database.');
      return;
    }

    ordersSnapshot.docs.forEach((doc, index) => {
      const order = doc.data();
      console.log(`--- Order ${index + 1} ---`);
      console.log(`ID: ${doc.id}`);
      console.log(`Order Number: ${order.orderNumber}`);
      console.log(`Status: ${order.status}`);
      console.log(`Seller ID: ${order.sellerId}`);
      console.log(`Seller Name: ${order.sellerName}`);
      console.log(`User ID: ${order.userId}`);
      console.log(`User Name: ${order.userName}`);
      console.log(`User Email: ${order.userEmail}`);
      console.log(`Total: ₹${order.total}`);
      console.log(`Items: ${order.items?.length || 0}`);
      console.log(`Created At: ${order.createdAt}`);
      console.log('');
    });

    // Check users to see who is a seller
    console.log('\n--- Checking Sellers ---\n');
    const usersSnapshot = await db.collection('users').where('role', '==', 'seller').get();
    console.log(`Total sellers: ${usersSnapshot.docs.length}\n`);
    
    usersSnapshot.docs.forEach((doc, index) => {
      const user = doc.data();
      console.log(`Seller ${index + 1}:`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error checking orders:', error);
  } finally {
    process.exit(0);
  }
}

checkOrders();
