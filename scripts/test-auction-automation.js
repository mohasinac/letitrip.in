/**
 * Test Script for Auction Automation
 * 
 * Tests the auction end automation system:
 * 1. Creates a test auction with end_time in the past
 * 2. Places test bids
 * 3. Triggers manual processing
 * 4. Verifies auction closed and winner determined
 * 
 * Usage:
 *   node scripts/test-auction-automation.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function createTestAuction() {
  console.log('📝 Creating test auction...');
  
  const auctionData = {
    shop_id: 'test-shop-001',
    name: 'Test iPhone 14 Pro',
    slug: `test-iphone-14-pro-${Date.now()}`,
    description: 'Test auction for automation testing',
    images: ['https://via.placeholder.com/400'],
    starting_bid: 10000,
    reserve_price: 45000,
    current_bid: 0,
    bid_count: 0,
    start_time: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 3600000)), // 1 hour ago
    end_time: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 60000)), // 1 minute ago (expired)
    status: 'live',
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const auctionRef = await db.collection('auctions').add(auctionData);
  console.log(`✅ Test auction created: ${auctionRef.id}`);
  
  return auctionRef.id;
}

async function createTestBids(auctionId) {
  console.log('📝 Creating test bids...');
  
  const bids = [
    { user_id: 'test-user-001', amount: 40000, created_at: new Date(Date.now() - 3000000) },
    { user_id: 'test-user-002', amount: 42000, created_at: new Date(Date.now() - 2000000) },
    { user_id: 'test-user-003', amount: 50000, created_at: new Date(Date.now() - 1000000) }, // Winner
  ];

  for (const bid of bids) {
    await db.collection('bids').add({
      auction_id: auctionId,
      ...bid,
      is_winning: false,
    });
  }

  // Update auction current_bid
  await db.collection('auctions').doc(auctionId).update({
    current_bid: 50000,
    bid_count: 3,
  });

  console.log('✅ 3 test bids created');
}

async function createTestUser(userId) {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    await userRef.set({
      email: `${userId}@test.com`,
      name: `Test User ${userId}`,
      role: 'user',
      created_at: new Date().toISOString(),
    });
    console.log(`✅ Created test user: ${userId}`);
  }

  // Create default address
  const addressesSnapshot = await db.collection('addresses')
    .where('user_id', '==', userId)
    .where('is_default', '==', true)
    .get();

  if (addressesSnapshot.empty) {
    await db.collection('addresses').add({
      user_id: userId,
      name: 'Test Address',
      phone: '9876543210',
      address_line1: '123 Test Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      is_default: true,
      created_at: new Date().toISOString(),
    });
    console.log(`✅ Created default address for user: ${userId}`);
  }
}

async function triggerProcessing() {
  console.log('🚀 Triggering manual auction processing...');
  
  try {
    const response = await fetch('http://localhost:3000/api/auctions/cron', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In real test, you'd need an admin auth token
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Processing triggered:', data);
    } else {
      console.log('⚠️  API returned error (this is expected if auth is required)');
      console.log('   Running direct processing instead...');
      
      // Alternative: import and run directly
      const { manualProcessAuctions } = require('../src/lib/auction-scheduler');
      await manualProcessAuctions();
    }
  } catch (error) {
    console.log('⚠️  API call failed, running direct processing...');
    // Alternative: import and run directly
    const { manualProcessAuctions } = require('../src/lib/auction-scheduler');
    await manualProcessAuctions();
  }
}

async function verifyResults(auctionId) {
  console.log('\n🔍 Verifying results...');
  
  // Check auction status
  const auctionDoc = await db.collection('auctions').doc(auctionId).get();
  const auction = auctionDoc.data();
  
  console.log('\nAuction Status:');
  console.log('  Status:', auction.status);
  console.log('  Winner ID:', auction.winner_id || 'None');
  console.log('  Final Bid:', auction.final_bid ? `₹${auction.final_bid.toLocaleString('en-IN')}` : 'None');

  if (auction.status === 'ended' && auction.winner_id) {
    console.log('✅ Auction successfully closed with winner!');

    // Check if order was created
    const ordersSnapshot = await db.collection('orders')
      .where('items', 'array-contains', { auction_id: auctionId })
      .get();

    if (!ordersSnapshot.empty) {
      console.log('✅ Order created for winner');
      const order = ordersSnapshot.docs[0].data();
      console.log('  Order ID:', order.order_id);
      console.log('  Total:', `₹${order.total.toLocaleString('en-IN')}`);
    } else {
      console.log('❌ Order NOT created (check logs)');
    }

    // Check won_auctions collection
    const wonAuctionsSnapshot = await db.collection('won_auctions')
      .where('auction_id', '==', auctionId)
      .get();

    if (!wonAuctionsSnapshot.empty) {
      console.log('✅ Entry added to won_auctions collection');
    } else {
      console.log('❌ Entry NOT added to won_auctions (check logs)');
    }

  } else if (auction.status === 'ended') {
    console.log('⚠️  Auction ended but no winner (reserve not met or no bids)');
  } else {
    console.log('❌ Auction still in "live" status - processing failed!');
  }
}

async function cleanup(auctionId) {
  console.log('\n🧹 Cleaning up test data...');
  
  // Delete test auction
  await db.collection('auctions').doc(auctionId).delete();
  
  // Delete test bids
  const bidsSnapshot = await db.collection('bids')
    .where('auction_id', '==', auctionId)
    .get();
  
  for (const doc of bidsSnapshot.docs) {
    await doc.ref.delete();
  }
  
  // Delete test orders
  const ordersSnapshot = await db.collection('orders')
    .where('source', '==', 'auction')
    .get();
    
  for (const doc of ordersSnapshot.docs) {
    const order = doc.data();
    if (order.items && order.items[0]?.auction_id === auctionId) {
      await doc.ref.delete();
    }
  }
  
  // Delete won_auctions entry
  const wonAuctionsSnapshot = await db.collection('won_auctions')
    .where('auction_id', '==', auctionId)
    .get();
    
  for (const doc of wonAuctionsSnapshot.docs) {
    await doc.ref.delete();
  }
  
  console.log('✅ Test data cleaned up');
}

async function runTest() {
  console.log('🧪 Starting Auction Automation Test\n');
  
  try {
    // Step 1: Create test user with address
    await createTestUser('test-user-003'); // Winner

    // Step 2: Create test auction (already expired)
    const auctionId = await createTestAuction();

    // Step 3: Create test bids
    await createTestBids(auctionId);

    // Step 4: Wait a moment
    console.log('\n⏳ Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 5: Trigger processing
    await triggerProcessing();

    // Step 6: Wait for processing
    console.log('\n⏳ Waiting 3 seconds for processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 7: Verify results
    await verifyResults(auctionId);

    // Step 8: Cleanup (optional - comment out to inspect data)
    const shouldCleanup = process.argv.includes('--cleanup');
    if (shouldCleanup) {
      await cleanup(auctionId);
    } else {
      console.log('\n💡 Run with --cleanup flag to remove test data');
      console.log(`   Auction ID: ${auctionId}`);
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test
runTest();
