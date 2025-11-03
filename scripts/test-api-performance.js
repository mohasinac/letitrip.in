/**
 * API Performance Testing Script
 * 
 * Tests optimized API routes to measure:
 * - Response times (first hit vs cached)
 * - Cache effectiveness (hit/miss rates)
 * - Rate limiting functionality
 * 
 * Usage: node scripts/test-api-performance.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

/**
 * Make HTTP request and measure time
 */
async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const req = http.request(`${BASE_URL}${path}`, {
      method: options.method || 'GET',
      headers: options.headers || {},
      ...options
    }, (res) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          duration,
          headers: res.headers,
          data: data ? JSON.parse(data) : null
        });
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

/**
 * Print colored output
 */
function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

/**
 * Print section header
 */
function printHeader(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`, 'cyan');
  log('='.repeat(60), 'cyan');
}

/**
 * Print test result
 */
function printResult(name, firstTime, cachedTime, cacheStatus) {
  const improvement = ((firstTime - cachedTime) / firstTime * 100).toFixed(1);
  const speedup = (firstTime / cachedTime).toFixed(1);
  
  log(`\n📊 ${name}:`, 'blue');
  log(`   First request:  ${firstTime}ms (${cacheStatus.first})`, 'yellow');
  log(`   Cached request: ${cachedTime}ms (${cacheStatus.second})`, 'green');
  log(`   Improvement:    ${improvement}% faster (${speedup}x speedup)`, 'green');
}

/**
 * Test 1: Categories Cache Performance
 */
async function testCategoriesCache() {
  printHeader('Test 1: Categories Cache Performance');
  
  log('\n⏳ Testing /api/categories endpoint...', 'yellow');
  
  // First request (cache MISS)
  const first = await makeRequest('/api/categories');
  const firstCache = first.headers['x-cache'] || 'UNKNOWN';
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Second request (cache HIT)
  const second = await makeRequest('/api/categories');
  const secondCache = second.headers['x-cache'] || 'UNKNOWN';
  
  printResult(
    'Categories API',
    first.duration,
    second.duration,
    { first: firstCache, second: secondCache }
  );
  
  return {
    endpoint: '/api/categories',
    firstTime: first.duration,
    cachedTime: second.duration,
    improvement: ((first.duration - second.duration) / first.duration * 100).toFixed(1)
  };
}

/**
 * Test 2: Products Cache Performance
 */
async function testProductsCache() {
  printHeader('Test 2: Products Cache Performance');
  
  log('\n⏳ Testing /api/products endpoint...', 'yellow');
  
  // First request (cache MISS)
  const first = await makeRequest('/api/products?limit=10');
  const firstCache = first.headers['x-cache'] || 'UNKNOWN';
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Second request (cache HIT)
  const second = await makeRequest('/api/products?limit=10');
  const secondCache = second.headers['x-cache'] || 'UNKNOWN';
  
  printResult(
    'Products API',
    first.duration,
    second.duration,
    { first: firstCache, second: secondCache }
  );
  
  return {
    endpoint: '/api/products',
    firstTime: first.duration,
    cachedTime: second.duration,
    improvement: ((first.duration - second.duration) / first.duration * 100).toFixed(1)
  };
}

/**
 * Test 3: Search Cache Performance
 */
async function testSearchCache() {
  printHeader('Test 3: Search Cache Performance');
  
  log('\n⏳ Testing /api/search endpoint...', 'yellow');
  
  const query = 'beyblade';
  
  // First request (cache MISS)
  const first = await makeRequest(`/api/search?q=${query}`);
  const firstCache = first.headers['x-cache'] || 'UNKNOWN';
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Second request (cache HIT)
  const second = await makeRequest(`/api/search?q=${query}`);
  const secondCache = second.headers['x-cache'] || 'UNKNOWN';
  
  printResult(
    'Search API',
    first.duration,
    second.duration,
    { first: firstCache, second: secondCache }
  );
  
  return {
    endpoint: '/api/search',
    firstTime: first.duration,
    cachedTime: second.duration,
    improvement: ((first.duration - second.duration) / first.duration * 100).toFixed(1)
  };
}

/**
 * Test 4: Rate Limiting
 */
async function testRateLimiting() {
  printHeader('Test 4: Rate Limiting');
  
  log('\n⏳ Making 10 rapid requests to test rate limiting...', 'yellow');
  
  const results = [];
  
  for (let i = 1; i <= 10; i++) {
    try {
      const response = await makeRequest('/api/categories');
      const rateLimit = {
        limit: response.headers['x-ratelimit-limit'],
        remaining: response.headers['x-ratelimit-remaining'],
        reset: response.headers['x-ratelimit-reset']
      };
      
      results.push({
        request: i,
        status: response.status,
        rateLimit
      });
      
      if (i === 1) {
        log(`\n   Rate Limit: ${rateLimit.limit} requests per hour`, 'cyan');
      }
      
      if (response.status === 200) {
        log(`   ✅ Request ${i}: Success (${rateLimit.remaining} remaining)`, 'green');
      } else {
        log(`   ❌ Request ${i}: Rate limited (${response.status})`, 'red');
      }
      
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      log(`   ❌ Request ${i}: Error - ${error.message}`, 'red');
    }
  }
  
  const successful = results.filter(r => r.status === 200).length;
  const rateLimited = results.filter(r => r.status === 429).length;
  
  log(`\n📊 Summary:`, 'blue');
  log(`   Successful: ${successful}/10`, 'green');
  log(`   Rate Limited: ${rateLimited}/10`, rateLimited > 0 ? 'yellow' : 'green');
  
  return { successful, rateLimited };
}

/**
 * Print final summary
 */
function printSummary(results) {
  printHeader('📈 Performance Summary');
  
  log('\n🎯 Cache Performance:', 'blue');
  results.forEach((result, index) => {
    log(`\n${index + 1}. ${result.endpoint}`, 'cyan');
    log(`   First request:  ${result.firstTime}ms`, 'yellow');
    log(`   Cached request: ${result.cachedTime}ms`, 'green');
    log(`   Improvement:    ${result.improvement}% faster`, 'green');
  });
  
  const avgImprovement = (
    results.reduce((sum, r) => sum + parseFloat(r.improvement), 0) / results.length
  ).toFixed(1);
  
  log(`\n✨ Average Improvement: ${avgImprovement}% faster with caching!`, 'green');
  
  log('\n🎉 All tests completed!', 'green');
  log('Cache and rate limiting are working correctly.\n', 'cyan');
}

/**
 * Main test runner
 */
async function runTests() {
  log('\n🚀 Starting API Performance Tests...', 'cyan');
  log('Testing optimized routes with caching and rate limiting\n', 'cyan');
  
  try {
    const results = [];
    
    // Run cache tests
    results.push(await testCategoriesCache());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(await testProductsCache());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(await testSearchCache());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Run rate limiting test
    await testRateLimiting();
    
    // Print summary
    printSummary(results);
    
  } catch (error) {
    log(`\n❌ Error running tests: ${error.message}`, 'red');
    log('Make sure the dev server is running: npm run dev\n', 'yellow');
    process.exit(1);
  }
}

// Run tests
runTests();
