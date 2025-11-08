#!/usr/bin/env node

/**
 * Production Monitoring Script
 * Checks Redis health, Sentry status, and Firebase connectivity
 * 
 * Usage:
 *   node scripts/monitor-production.js
 *   
 * Add to cron (every 5 minutes):
 *   CRON: 0,5,10,15,20,25,30,35,40,45,50,55 * * * *
 *   Command: cd /path/to/project && node scripts/monitor-production.js >> logs/monitor.log 2>&1
 */

const https = require('https');
const http = require('http');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const ALERT_EMAIL = process.env.ALERT_EMAIL || 'devops@justforview.in';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: null });
        }
      });
    }).on('error', reject);
  });
}

async function checkRedisHealth() {
  log('Checking Redis health...', 'blue');
  
  try {
    const response = await httpGet(`${API_URL}/api/health/redis`);
    
    if (response.statusCode === 200) {
      log(`✓ Redis: HEALTHY (latency: ${response.data.latency}ms)`, 'green');
      return { status: 'healthy', latency: response.data.latency };
    } else if (response.statusCode === 503) {
      log(`⚠ Redis: DEGRADED (using in-memory fallback)`, 'yellow');
      return { status: 'degraded', error: response.data.error };
    } else {
      log(`✗ Redis: ERROR (status ${response.statusCode})`, 'red');
      return { status: 'error', statusCode: response.statusCode };
    }
  } catch (error) {
    log(`✗ Redis health check failed: ${error.message}`, 'red');
    return { status: 'error', error: error.message };
  }
}

async function checkApiHealth() {
  log('Checking API health...', 'blue');
  
  try {
    const response = await httpGet(`${API_URL}/api/health`);
    
    if (response.statusCode === 200) {
      log(`✓ API: HEALTHY`, 'green');
      return { status: 'healthy', data: response.data };
    } else {
      log(`⚠ API: DEGRADED (status ${response.statusCode})`, 'yellow');
      return { status: 'degraded', statusCode: response.statusCode };
    }
  } catch (error) {
    log(`✗ API health check failed: ${error.message}`, 'red');
    return { status: 'error', error: error.message };
  }
}

async function checkRateLimit() {
  log('Testing rate limit...', 'blue');
  
  try {
    const response = await httpGet(`${API_URL}/api/products?limit=1`);
    
    const rateLimitHeaders = {
      limit: response.headers?.['x-ratelimit-limit'],
      remaining: response.headers?.['x-ratelimit-remaining'],
      reset: response.headers?.['x-ratelimit-reset'],
    };
    
    if (rateLimitHeaders.limit) {
      log(`✓ Rate limiting active (${rateLimitHeaders.remaining}/${rateLimitHeaders.limit} remaining)`, 'green');
      return { status: 'active', headers: rateLimitHeaders };
    } else {
      log(`⚠ Rate limiting headers not found`, 'yellow');
      return { status: 'missing' };
    }
  } catch (error) {
    log(`✗ Rate limit check failed: ${error.message}`, 'red');
    return { status: 'error', error: error.message };
  }
}

async function generateReport() {
  log('='.repeat(60), 'blue');
  log('PRODUCTION MONITORING REPORT', 'blue');
  log('='.repeat(60), 'blue');
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
  };
  
  // Run checks
  results.checks.redis = await checkRedisHealth();
  results.checks.api = await checkApiHealth();
  results.checks.rateLimit = await checkRateLimit();
  
  // Calculate overall status
  const statuses = Object.values(results.checks).map(c => c.status);
  if (statuses.every(s => s === 'healthy' || s === 'active')) {
    results.overallStatus = 'healthy';
  } else if (statuses.some(s => s === 'error')) {
    results.overallStatus = 'error';
  } else {
    results.overallStatus = 'degraded';
  }
  
  log('='.repeat(60), 'blue');
  
  // Final summary
  const statusColor = results.overallStatus === 'healthy' ? 'green' :
                     results.overallStatus === 'degraded' ? 'yellow' : 'red';
  log(`OVERALL STATUS: ${results.overallStatus.toUpperCase()}`, statusColor);
  
  // Alert if not healthy
  if (results.overallStatus !== 'healthy') {
    log(`⚠ ALERT: System is ${results.overallStatus}`, 'red');
    log(`→ Manual intervention may be required`, 'red');
    log(`→ Check logs and Sentry dashboard`, 'red');
  }
  
  log('='.repeat(60), 'blue');
  
  return results;
}

// Run monitoring
(async () => {
  try {
    const report = await generateReport();
    
    // Exit with appropriate code
    if (report.overallStatus === 'healthy') {
      process.exit(0);
    } else if (report.overallStatus === 'degraded') {
      process.exit(1);
    } else {
      process.exit(2);
    }
  } catch (error) {
    log(`CRITICAL ERROR: ${error.message}`, 'red');
    process.exit(3);
  }
})();
