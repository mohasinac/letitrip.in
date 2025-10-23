#!/usr/bin/env node

/**
 * Firebase Initialization and Setup Script
 * Run this script to initialize Firebase with proper configuration and sample data
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');
const { getAuth, connectAuthEmulator } = require('firebase/auth');
const { getStorage, connectStorageEmulator } = require('firebase/storage');
const admin = require('firebase-admin');

// Check if running in development
const isDev = process.env.NODE_ENV !== 'production';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCL2eA6_wFSMcyel9pxntnVOm7SFh2iWTM",
  authDomain: "justforview1.firebaseapp.com",
  projectId: "justforview1",
  storageBucket: "justforview1.firebasestorage.app",
  messagingSenderId: "995821948299",
  appId: "1:995821948299:web:38d1decb11eca69c7d738e",
  measurementId: "G-4BLN02DGVX"
};

// Initialize Firebase
console.log('🔥 Initializing Firebase...');

// Client-side initialization
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Admin SDK initialization
let adminApp;
try {
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');
    
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || "justforview1",
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      storageBucket: `${process.env.FIREBASE_ADMIN_PROJECT_ID || "justforview1"}.appspot.com`,
    });
    
    console.log('✅ Firebase Admin initialized');
  } else {
    console.log('⚠️  Firebase Admin credentials not found. Admin features will be limited.');
  }
} catch (error) {
  console.log('⚠️  Firebase Admin initialization failed:', error.message);
}

// Connect to emulators in development
if (isDev && process.env.USE_FIREBASE_EMULATOR === 'true') {
  console.log('🧪 Connecting to Firebase Emulators...');
  
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('✅ Connected to Firebase Emulators');
  } catch (error) {
    console.log('⚠️  Emulator connection failed:', error.message);
  }
}

// Sample data initialization
async function initializeSampleData() {
  console.log('📊 Initializing sample data...');
  
  try {
    // Initialize sample data directly since we can't import TS files in Node.js
    console.log('Adding sample data to Firestore...');
    
    const adminDb = adminApp ? admin.firestore(adminApp) : null;
    
    if (!adminDb) {
      console.log('⚠️  Cannot add sample data without Admin SDK');
      return;
    }

    // Sample products data
    const sampleProducts = [
      {
        name: "Rare Vintage Beyblade Metal Series",
        slug: "rare-vintage-beyblade-metal-series",
        description: "Authentic Takara Tomy Beyblade with metal fusion technology. This rare vintage piece is in excellent condition and comes with original packaging. Perfect for collectors and competitive play.",
        shortDescription: "Authentic Takara Tomy Metal Fusion Beyblade",
        price: 1590,
        compareAtPrice: 1890,
        cost: 800,
        sku: "BB-001-VTG",
        barcode: "1234567890123",
        quantity: 15,
        lowStockThreshold: 5,
        weight: 0.15,
        dimensions: {
          length: 5,
          width: 5,
          height: 3,
          unit: "cm"
        },
        images: [
          { url: "/images/product-1.jpg", alt: "Vintage Beyblade Metal Series", order: 1 },
          { url: "/images/product-1-2.jpg", alt: "Beyblade Detail View", order: 2 }
        ],
        category: "Beyblades",
        tags: ["vintage", "metal", "fusion", "takara tomy", "rare"],
        status: "active",
        isFeatured: true,
        seo: {
          title: "Rare Vintage Beyblade Metal Series - Authentic Takara Tomy",
          description: "Get your hands on this rare vintage Beyblade from the Metal Fusion series. Authentic Takara Tomy product in mint condition.",
          keywords: ["beyblade", "metal fusion", "vintage", "takara tomy", "collectible"]
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: "Professional Tournament Stadium",
        slug: "professional-tournament-stadium",
        description: "Official tournament-grade Beyblade stadium with high walls and smooth surface for optimal battle performance. Used in official competitions worldwide.",
        shortDescription: "Official tournament-grade stadium",
        price: 2999,
        compareAtPrice: 3499,
        cost: 1500,
        sku: "BS-002-PRO",
        quantity: 8,
        lowStockThreshold: 3,
        weight: 1.2,
        dimensions: {
          length: 40,
          width: 40,
          height: 10,
          unit: "cm"
        },
        images: [
          { url: "/images/product-2.jpg", alt: "Professional Tournament Stadium", order: 1 },
          { url: "/images/product-2-2.jpg", alt: "Stadium Detail", order: 2 }
        ],
        category: "Stadiums",
        tags: ["stadium", "tournament", "professional", "official"],
        status: "active",
        isFeatured: true,
        seo: {
          title: "Professional Tournament Stadium - Official Competition Grade",
          description: "Official tournament-grade Beyblade stadium for competitive play. High-quality construction for optimal battle performance.",
          keywords: ["beyblade stadium", "tournament", "professional", "competition"]
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    // Sample categories
    const sampleCategories = [
      {
        name: "Beyblades",
        slug: "beyblades",
        description: "Authentic Beyblade spinning tops and battle tops",
        image: "/images/category-beyblades.jpg",
        order: 1,
        status: "active",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: "Stadiums",
        slug: "stadiums",
        description: "Battle stadiums and arenas for competitive play",
        image: "/images/category-stadiums.jpg",
        order: 2,
        status: "active",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    // Sample auctions
    const sampleAuctions = [
      {
        title: "Ultra Rare Championship Beyblade",
        description: "This is an extremely rare championship edition beyblade that was used in the 2019 World Championships. Only a few of these were ever made for the tournament participants.",
        images: ["/images/auction-1.jpg", "/images/auction-1-2.jpg"],
        currentBid: 2500,
        startingBid: 1000,
        minimumBid: 2600,
        endTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 6 * 60 * 60 * 1000)), // 6 hours from now
        status: "live",
        bidCount: 15,
        category: "Beyblades",
        condition: "Mint",
        isAuthentic: true,
        sellerId: "seller_1",
        seller: {
          id: "seller_1",
          name: "ProCollectorShop",
          rating: 4.9,
          totalSales: 156,
          memberSince: "2020-01-15",
          verified: true
        },
        watchlist: [],
        shippingInfo: {
          domestic: {
            cost: 99,
            time: "3-5 business days"
          },
          international: {
            available: true,
            cost: 299,
            time: "7-14 business days"
          }
        },
        returnPolicy: "No returns on auction items unless item is significantly not as described. All sales are final.",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    // Add products
    console.log('Adding sample products...');
    for (const product of sampleProducts) {
      await adminDb.collection('products').add(product);
    }

    // Add categories
    console.log('Adding sample categories...');
    for (const category of sampleCategories) {
      await adminDb.collection('categories').add(category);
    }

    // Add auctions
    console.log('Adding sample auctions...');
    for (const auction of sampleAuctions) {
      await adminDb.collection('auctions').add(auction);
    }

    console.log('✅ Sample data initialized successfully');
  } catch (error) {
    console.error('❌ Sample data initialization failed:', error.message);
  }
}

// Create admin user
async function createAdminUser() {
  if (!adminApp) {
    console.log('⚠️  Skipping admin user creation - Admin SDK not initialized');
    return;
  }

  console.log('👤 Creating admin user...');
  
  try {
    const adminAuth = admin.auth(adminApp);
    const adminDb = admin.firestore(adminApp);
    
    // Check if admin user already exists
    try {
      await adminAuth.getUserByEmail('admin@justforview.in');
      console.log('✅ Admin user already exists');
      return;
    } catch (error) {
      // User doesn't exist, create it
    }
    
    // Create admin user
    const adminUser = await adminAuth.createUser({
      email: 'admin@justforview.in',
      password: 'admin123456',
      displayName: 'Admin User',
      emailVerified: true,
    });
    
    // Set custom claims
    await adminAuth.setCustomUserClaims(adminUser.uid, { role: 'admin' });
    
    // Create user profile in Firestore
    await adminDb.collection('users').doc(adminUser.uid).set({
      email: 'admin@justforview.in',
      name: 'Admin User',
      role: 'admin',
      emailVerified: true,
      accountStatus: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('✅ Admin user created successfully');
    console.log('   Email: admin@justforview.in');
    console.log('   Password: admin123456');
  } catch (error) {
    console.error('❌ Admin user creation failed:', error.message);
  }
}

// Main initialization function
async function initializeFirebase() {
  console.log('🚀 Starting Firebase initialization...');
  
  try {
    // Initialize sample data
    await initializeSampleData();
    
    // Create admin user
    await createAdminUser();
    
    console.log('');
    console.log('🎉 Firebase initialization completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update your .env.local file with Firebase credentials');
    console.log('2. Deploy Firestore rules: firebase deploy --only firestore:rules');
    console.log('3. Deploy Storage rules: firebase deploy --only storage');
    console.log('4. Start your development server: npm run dev');
    console.log('');
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    process.exit(1);
  }
}

// Environment setup instructions
function printEnvironmentSetup() {
  console.log('');
  console.log('📋 Environment Setup Instructions:');
  console.log('');
  console.log('Create a .env.local file in your project root with the following variables:');
  console.log('');
  console.log('# Firebase Client Config');
  console.log('NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key');
  console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com');
  console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id');
  console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com');
  console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id');
  console.log('NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id');
  console.log('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id');
  console.log('');
  console.log('# Firebase Admin Config (for server-side operations)');
  console.log('FIREBASE_ADMIN_PROJECT_ID=your_project_id');
  console.log('FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email');
  console.log('FIREBASE_ADMIN_PRIVATE_KEY="your_private_key"');
  console.log('');
  console.log('# Development');
  console.log('USE_FIREBASE_EMULATOR=true  # Set to false in production');
  console.log('');
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--env-setup')) {
  printEnvironmentSetup();
} else if (args.includes('--init-data')) {
  initializeSampleData();
} else if (args.includes('--create-admin')) {
  createAdminUser();
} else {
  initializeFirebase();
}

module.exports = {
  app,
  db,
  auth,
  storage,
  adminApp
};
