const fs = require('fs');
const path = require('path');

// Files that need to be fixed
const filesToFix = [
  'src/app/api/admin/notifications/[id]/toggle/route.ts',
  'src/app/api/admin/reviews/[id]/route.ts',
  'src/app/api/admin/users/[id]/role/route.ts',
  'src/app/api/admin/users/[id]/verify/route.ts',
  'src/app/api/coupons/[id]/route.ts',
  'src/app/api/reviews/[id]/helpful/route.ts',
  'src/app/api/sellers/[sellerId]/auctions/route.ts',
  'src/app/api/sellers/[sellerId]/products/route.ts',
  'src/app/api/sellers/[sellerId]/route.ts',
  'src/app/api/shipping/shiprocket/track/[awb]/route.ts'
];

function fixRouteHandler(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${fullPath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Fix params type declarations
  content = content.replace(
    /{ params }: { params: { ([^}]+) } }/g,
    '{ params }: { params: Promise<{ $1 }> }'
  );
  
  // Fix params usage - add await
  content = content.replace(
    /(\w+):\s*NextRequest,\s*{ params }: { params: Promise<[^>]+> }\s*\)\s*{/g,
    (match) => {
      return match + '\n    const resolvedParams = await params;';
    }
  );
  
  // Replace direct params.property usage with resolvedParams.property
  content = content.replace(/params\.(\w+)/g, 'resolvedParams.$1');
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Fixed: ${filePath}`);
}

// Run fixes
filesToFix.forEach(fixRouteHandler);
console.log('All route handlers fixed!');
