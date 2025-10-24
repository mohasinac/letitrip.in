#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/app/about/page.tsx',
  'src/app/categories/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/wishlist/page.tsx',
  'src/app/seller/orders/page.tsx',
  'src/app/seller/settings/page.tsx',
  'src/app/orders/page.tsx',
  'src/app/seller/dashboard/page.tsx',
  'src/app/search/page.tsx',
  'src/app/compare/page.tsx',
  'src/app/auctions/page.tsx',
  'src/app/admin/reviews/page.tsx',
  'src/app/admin/settings/page.tsx',
  'src/app/admin/orders/page.tsx',
  'src/app/admin/dashboard/page.tsx',
  'src/app/account/page.tsx',
  'src/app/(shop)/products/page.tsx'
];

const baseDir = process.cwd();

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(baseDir, filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Remove UnifiedLayout import
      content = content.replace(/import UnifiedLayout from ['"']@\/components\/layout\/UnifiedLayout['"];?\n?/g, '');
      
      // Remove UnifiedLayout wrapper tags
      content = content.replace(/<UnifiedLayout[^>]*>/g, '');
      content = content.replace(/<\/UnifiedLayout>/g, '');
      
      // Clean up any extra empty lines that might be left
      content = content.replace(/\n\n\n+/g, '\n\n');
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    } catch (error) {
      console.error(`Error updating ${filePath}:`, error.message);
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('UnifiedLayout removal complete!');
