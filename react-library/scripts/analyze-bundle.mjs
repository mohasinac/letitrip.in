#!/usr/bin/env node

/**
 * Bundle Size Analysis Script
 * 
 * Analyzes the library bundle sizes and provides optimization recommendations.
 */

import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distPath = join(__dirname, '../dist');

/**
 * Get file size in KB
 */
function getFileSize(filePath) {
  const stats = statSync(filePath);
  return (stats.size / 1024).toFixed(2);
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = join(dirPath, file);
    if (statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

/**
 * Analyze bundle
 */
function analyzeBundleSize() {
  console.log('\n📦 Bundle Size Analysis\n');
  console.log('=' .repeat(80));

  const allFiles = getAllFiles(distPath);

  // Group files by type
  const fileGroups = {
    esm: [],
    cjs: [],
    dts: [],
    css: [],
    map: [],
  };

  allFiles.forEach((file) => {
    const relativePath = file.replace(distPath, '');
    const size = getFileSize(file);

    if (file.endsWith('.js') && !file.endsWith('.cjs')) {
      fileGroups.esm.push({ path: relativePath, size: parseFloat(size) });
    } else if (file.endsWith('.cjs')) {
      fileGroups.cjs.push({ path: relativePath, size: parseFloat(size) });
    } else if (file.endsWith('.d.ts')) {
      fileGroups.dts.push({ path: relativePath, size: parseFloat(size) });
    } else if (file.endsWith('.css')) {
      fileGroups.css.push({ path: relativePath, size: parseFloat(size) });
    } else if (file.endsWith('.map')) {
      fileGroups.map.push({ path: relativePath, size: parseFloat(size) });
    }
  });

  // Calculate totals
  const totals = {
    esm: fileGroups.esm.reduce((sum, f) => sum + f.size, 0),
    cjs: fileGroups.cjs.reduce((sum, f) => sum + f.size, 0),
    dts: fileGroups.dts.reduce((sum, f) => sum + f.size, 0),
    css: fileGroups.css.reduce((sum, f) => sum + f.size, 0),
    map: fileGroups.map.reduce((sum, f) => sum + f.size, 0),
  };

  const grandTotal = Object.values(totals).reduce((sum, val) => sum + val, 0);

  // Print summary
  console.log('\n📊 Summary by Type:\n');
  console.log(`ESM Bundles:        ${totals.esm.toFixed(2)} KB (${fileGroups.esm.length} files)`);
  console.log(`CommonJS Bundles:   ${totals.cjs.toFixed(2)} KB (${fileGroups.cjs.length} files)`);
  console.log(`TypeScript Defs:    ${totals.dts.toFixed(2)} KB (${fileGroups.dts.length} files)`);
  console.log(`CSS Files:          ${totals.css.toFixed(2)} KB (${fileGroups.css.length} files)`);
  console.log(`Source Maps:        ${totals.map.toFixed(2)} KB (${fileGroups.map.length} files)`);
  console.log('-'.repeat(80));
  console.log(`Total Size:         ${grandTotal.toFixed(2)} KB (${allFiles.length} files)`);

  // Print largest ESM bundles
  console.log('\n📦 Largest ESM Bundles:\n');
  const sortedEsm = [...fileGroups.esm].sort((a, b) => b.size - a.size).slice(0, 10);
  sortedEsm.forEach((file, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${file.path.padEnd(50)} ${file.size.toFixed(2).padStart(8)} KB`);
  });

  // Print largest CJS bundles
  console.log('\n📦 Largest CommonJS Bundles:\n');
  const sortedCjs = [...fileGroups.cjs].sort((a, b) => b.size - a.size).slice(0, 10);
  sortedCjs.forEach((file, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${file.path.padEnd(50)} ${file.size.toFixed(2).padStart(8)} KB`);
  });

  // Optimization recommendations
  console.log('\n💡 Optimization Recommendations:\n');

  const largeChunks = fileGroups.esm.filter(f => f.size > 50);
  if (largeChunks.length > 0) {
    console.log(`⚠️  ${largeChunks.length} chunk(s) > 50KB detected. Consider code splitting:`);
    largeChunks.forEach(chunk => {
      console.log(`   - ${chunk.path}: ${chunk.size.toFixed(2)} KB`);
    });
  } else {
    console.log('✓ All chunks are under 50KB - good for loading performance');
  }

  const esmRatio = ((totals.esm / (totals.esm + totals.cjs)) * 100).toFixed(1);
  console.log(`\n✓ ESM/CJS ratio: ${esmRatio}% ESM, ${(100 - esmRatio).toFixed(1)}% CJS`);

  const mapRatio = ((totals.map / (totals.esm + totals.cjs)) * 100).toFixed(1);
  console.log(`✓ Source map overhead: ${mapRatio}% of bundle size`);

  console.log('\n' + '='.repeat(80));
  console.log('✅ Analysis complete!\n');

  // Return data for potential programmatic use
  return {
    totals,
    fileGroups,
    grandTotal,
  };
}

// Run analysis
try {
  analyzeBundleSize();
} catch (error) {
  console.error('❌ Error analyzing bundle:', error.message);
  process.exit(1);
}
