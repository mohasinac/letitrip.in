#!/usr/bin/env node

/**
 * Script to fix Next.js 16 async params in API routes
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/api/products/[id]/reviews/route.ts',
  'src/app/api/user/addresses/[id]/route.ts',
  'src/app/api/orders/[id]/route.ts',
  'src/app/api/auctions/[id]/watchlist/route.ts',
  'src/app/api/auctions/[id]/route.ts'
];

function fixApiRoute(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Fix params type definition
  content = content.replace(
    /{ params }: { params: { id: string } }/g,
    '{ params }: { params: Promise<{ id: string }> }'
  );
  
  // Fix params.id usage - find and replace patterns
  // Pattern 1: const someVar = params.id;
  content = content.replace(
    /const (\w+) = params\.id;/g,
    'const { id: $1 } = await params;'
  );
  
  // Pattern 2: params.id directly used
  content = content.replace(
    /params\.id/g,
    '(await params).id'
  );
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Fixed: ${filePath}`);
}

console.log('🔧 Fixing Next.js 16 async params in API routes...');

filesToFix.forEach(fixApiRoute);

console.log('✅ All API routes fixed!');
