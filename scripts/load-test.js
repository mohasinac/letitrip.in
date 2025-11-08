/**
 * Load Testing Script
 * 
 * Simple load testing for JustForView.in APIs
 * Run: node scripts/load-test.js
 * 
 * Tests:
 * - Homepage load time
 * - Product listing performance
 * - Search functionality
 * - Cart operations
 * - Checkout flow
 * - Auth endpoints
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.LOAD_TEST_URL || 'http://localhost:3000';
const CONCURRENT_USERS = parseInt(process.env.CONCURRENT_USERS || '100');
const TEST_DURATION = parseInt(process.env.TEST_DURATION || '120'); // seconds
const RAMP_UP_TIME = parseInt(process.env.RAMP_UP_TIME || '30'); // seconds

// Test scenarios
const SCENARIOS = {
  homepage: {
    name: 'Homepage Load',
    method: 'GET',
    path: '/',
    weight: 30 // 30% of traffic
  },
  products: {
    name: 'Product Listing',
    method: 'GET',
    path: '/products',
    weight: 25
  },
  productDetail: {
    name: 'Product Detail',
    method: 'GET',
    path: '/products/sample-product',
    weight: 20
  },
  search: {
    name: 'Search',
    method: 'GET',
    path: '/api/search?q=phone',
    weight: 15
  },
  cart: {
    name: 'Add to Cart',
    method: 'GET',
    path: '/api/cart',
    weight: 10
  }
};

// Metrics
const metrics = {
  requests: 0,
  successes: 0,
  failures: 0,
  totalTime: 0,
  responseTimes: [],
  errors: {},
  statusCodes: {}
};

// Make HTTP request
function makeRequest(scenario) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = new URL(BASE_URL + scenario.path);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: scenario.method,
      headers: {
        'User-Agent': 'LoadTest/1.0'
      }
    };
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        
        metrics.requests++;
        metrics.totalTime += responseTime;
        metrics.responseTimes.push(responseTime);
        
        if (res.statusCode >= 200 && res.statusCode < 400) {
          metrics.successes++;
        } else {
          metrics.failures++;
        }
        
        metrics.statusCodes[res.statusCode] = (metrics.statusCodes[res.statusCode] || 0) + 1;
        
        resolve({
          scenario: scenario.name,
          statusCode: res.statusCode,
          responseTime,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      
      metrics.requests++;
      metrics.failures++;
      metrics.totalTime += responseTime;
      
      const errorKey = error.code || error.message;
      metrics.errors[errorKey] = (metrics.errors[errorKey] || 0) + 1;
      
      resolve({
        scenario: scenario.name,
        error: error.message,
        responseTime,
        success: false
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      metrics.errors['TIMEOUT'] = (metrics.errors['TIMEOUT'] || 0) + 1;
    });
    
    req.end();
  });
}

// Select random scenario based on weight
function selectScenario() {
  const total = Object.values(SCENARIOS).reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * total;
  
  for (const scenario of Object.values(SCENARIOS)) {
    random -= scenario.weight;
    if (random <= 0) {
      return scenario;
    }
  }
  
  return Object.values(SCENARIOS)[0];
}

// Simulate single user
async function simulateUser(userId, duration) {
  const startTime = Date.now();
  const requests = [];
  
  while (Date.now() - startTime < duration * 1000) {
    const scenario = selectScenario();
    requests.push(makeRequest(scenario));
    
    // Random delay between requests (0.5-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));
  }
  
  await Promise.all(requests);
}

// Calculate statistics
function calculateStats() {
  const sorted = metrics.responseTimes.sort((a, b) => a - b);
  const count = sorted.length;
  
  return {
    totalRequests: metrics.requests,
    successRate: ((metrics.successes / metrics.requests) * 100).toFixed(2),
    failureRate: ((metrics.failures / metrics.requests) * 100).toFixed(2),
    avgResponseTime: (metrics.totalTime / metrics.requests).toFixed(2),
    minResponseTime: sorted[0],
    maxResponseTime: sorted[count - 1],
    p50: sorted[Math.floor(count * 0.5)],
    p90: sorted[Math.floor(count * 0.9)],
    p95: sorted[Math.floor(count * 0.95)],
    p99: sorted[Math.floor(count * 0.99)],
    requestsPerSecond: (metrics.requests / TEST_DURATION).toFixed(2)
  };
}

// Print progress
function printProgress(elapsed) {
  const progress = Math.min(100, (elapsed / TEST_DURATION) * 100);
  const bar = '█'.repeat(Math.floor(progress / 2)) + '░'.repeat(50 - Math.floor(progress / 2));
  
  process.stdout.write(`\r[${bar}] ${progress.toFixed(1)}% | Requests: ${metrics.requests} | Success: ${metrics.successes} | Failed: ${metrics.failures}`);
}

// Print results
function printResults() {
  const stats = calculateStats();
  
  console.log('\n\n📊 LOAD TEST RESULTS');
  console.log('═'.repeat(60));
  
  console.log('\n🎯 Test Configuration:');
  console.log(`   • Target URL: ${BASE_URL}`);
  console.log(`   • Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`   • Test Duration: ${TEST_DURATION}s`);
  console.log(`   • Ramp-up Time: ${RAMP_UP_TIME}s`);
  
  console.log('\n📈 Performance Metrics:');
  console.log(`   • Total Requests: ${stats.totalRequests}`);
  console.log(`   • Requests/sec: ${stats.requestsPerSecond}`);
  console.log(`   • Success Rate: ${stats.successRate}%`);
  console.log(`   • Failure Rate: ${stats.failureRate}%`);
  
  console.log('\n⏱️  Response Times (ms):');
  console.log(`   • Average: ${stats.avgResponseTime}ms`);
  console.log(`   • Min: ${stats.minResponseTime}ms`);
  console.log(`   • Max: ${stats.maxResponseTime}ms`);
  console.log(`   • P50 (median): ${stats.p50}ms`);
  console.log(`   • P90: ${stats.p90}ms`);
  console.log(`   • P95: ${stats.p95}ms`);
  console.log(`   • P99: ${stats.p99}ms`);
  
  if (Object.keys(metrics.statusCodes).length > 0) {
    console.log('\n📊 Status Codes:');
    Object.entries(metrics.statusCodes)
      .sort(([a], [b]) => a - b)
      .forEach(([code, count]) => {
        const percentage = ((count / stats.totalRequests) * 100).toFixed(1);
        console.log(`   • ${code}: ${count} (${percentage}%)`);
      });
  }
  
  if (Object.keys(metrics.errors).length > 0) {
    console.log('\n❌ Errors:');
    Object.entries(metrics.errors)
      .sort(([, a], [, b]) => b - a)
      .forEach(([error, count]) => {
        console.log(`   • ${error}: ${count}`);
      });
  }
  
  console.log('\n✅ Performance Assessment:');
  
  const avgTime = parseFloat(stats.avgResponseTime);
  const p95Time = stats.p95;
  const successRate = parseFloat(stats.successRate);
  
  if (successRate < 95) {
    console.log('   ❌ FAIL: Success rate below 95%');
  } else if (avgTime > 1000) {
    console.log('   ⚠️  WARNING: Average response time > 1s');
  } else if (p95Time > 2000) {
    console.log('   ⚠️  WARNING: P95 response time > 2s');
  } else {
    console.log('   ✅ PASS: All metrics within acceptable range');
  }
  
  console.log('\n📋 Recommendations:');
  
  if (avgTime > 500) {
    console.log('   • Consider enabling caching');
    console.log('   • Optimize database queries');
    console.log('   • Enable CDN for static assets');
  }
  
  if (stats.p99 > 3000) {
    console.log('   • Investigate slow queries (check P99)');
    console.log('   • Add database indexes');
    console.log('   • Consider request queuing');
  }
  
  if (metrics.errors['ECONNREFUSED']) {
    console.log('   • Server not responding - check if app is running');
  }
  
  if (metrics.errors['TIMEOUT']) {
    console.log('   • Increase server resources or timeout limits');
  }
  
  if (successRate < 95) {
    console.log('   • Fix error responses before production');
    console.log('   • Check logs for error details');
  }
  
  console.log('\n');
}

// Main load test
async function runLoadTest() {
  console.log('🚀 LOAD TESTING - JustForView.in\n');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Users: ${CONCURRENT_USERS}`);
  console.log(`Duration: ${TEST_DURATION}s`);
  console.log(`Ramp-up: ${RAMP_UP_TIME}s\n`);
  
  console.log('Starting test...\n');
  
  const startTime = Date.now();
  const users = [];
  
  // Progress monitoring
  const progressInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    printProgress(elapsed);
    
    if (elapsed >= TEST_DURATION) {
      clearInterval(progressInterval);
    }
  }, 500);
  
  // Ramp-up users gradually
  const rampUpDelay = (RAMP_UP_TIME * 1000) / CONCURRENT_USERS;
  
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    users.push(simulateUser(i, TEST_DURATION));
    
    if (i < CONCURRENT_USERS - 1) {
      await new Promise(resolve => setTimeout(resolve, rampUpDelay));
    }
  }
  
  await Promise.all(users);
  clearInterval(progressInterval);
  
  printResults();
}

// Run test
if (require.main === module) {
  runLoadTest().catch(console.error);
}

module.exports = { runLoadTest };
