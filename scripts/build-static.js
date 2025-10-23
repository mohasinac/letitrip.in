#!/usr/bin/env node

/**
 * Build script for static export
 * Temporarily moves API routes and builds for static hosting
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
const apiBackupDir = path.join(process.cwd(), 'src', 'app', 'api_backup');

function moveApiRoutes() {
  if (fs.existsSync(apiDir)) {
    console.log('📁 Moving API routes to backup...');
    fs.renameSync(apiDir, apiBackupDir);
  }
}

function restoreApiRoutes() {
  if (fs.existsSync(apiBackupDir)) {
    console.log('📁 Restoring API routes...');
    fs.renameSync(apiBackupDir, apiDir);
  }
}

function buildStatic() {
  try {
    console.log('🔧 Building static export...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Static build completed!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    throw error;
  }
}

async function main() {
  try {
    // Move API routes temporarily
    moveApiRoutes();
    
    // Build static export
    buildStatic();
    
    console.log('');
    console.log('🎉 Static build ready for deployment!');
    console.log('');
    console.log('To deploy to Firebase Hosting:');
    console.log('firebase deploy --only hosting');
    console.log('');
    
  } catch (error) {
    console.error('Build process failed:', error);
  } finally {
    // Always restore API routes
    restoreApiRoutes();
  }
}

main();
