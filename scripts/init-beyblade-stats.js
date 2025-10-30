/**
 * Database Initialization Script
 * Run this to initialize Beyblade stats in Firebase
 * 
 * Usage: node scripts/init-beyblade-stats.js
 */

const fetch = require('node-fetch');

async function initializeBeybladeStats() {
  console.log('🎮 Initializing Beyblade Stats in Firebase...\n');
  
  try {
    // Get your server URL (adjust if needed)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/beyblades/init`;
    
    console.log(`📡 Sending request to: ${url}\n`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success! Beyblade stats initialized\n');
      
      // Fetch and display all Beyblades
      console.log('📊 Fetching all Beyblades...\n');
      const listResponse = await fetch(`${baseUrl}/api/beyblades`);
      const listData = await listResponse.json();
      
      if (listData.success) {
        console.log(`Found ${listData.data.length} Beyblades:\n`);
        listData.data.forEach(bey => {
          console.log(`  🎯 ${bey.displayName}`);
          console.log(`     Type: ${bey.type} | Spin: ${bey.spinDirection}`);
          console.log(`     Mass: ${bey.mass}kg | Max Spin: ${bey.maxSpin}`);
          console.log(`     Special: ${bey.specialMove.name}\n`);
        });
      }
      
      console.log('✅ Initialization complete!\n');
      console.log('🌐 View admin page at: http://localhost:3000/admin/beyblade-stats\n');
      
    } else {
      console.error('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Failed to initialize:', error.message);
    console.log('\n💡 Make sure your development server is running:');
    console.log('   npm run dev\n');
  }
}

// Run if called directly
if (require.main === module) {
  initializeBeybladeStats();
}

module.exports = { initializeBeybladeStats };
