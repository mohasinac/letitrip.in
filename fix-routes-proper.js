const fs = require('fs');
const path = require('path');

// Files that still need fixing
const filesToFix = [
  'src/app/api/admin/notifications/[id]/toggle/route.ts',
  'src/app/api/admin/reviews/[id]/route.ts', 
  'src/app/api/admin/users/[id]/role/route.ts',
  'src/app/api/admin/users/[id]/verify/route.ts',
  'src/app/api/coupons/[id]/route.ts',
  'src/app/api/reviews/[id]/helpful/route.ts',
  'src/app/api/shipping/shiprocket/track/[awb]/route.ts'
];

function fixRouteHandlerProper(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${fullPath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Remove the incorrect resolvedParams lines
  content = content.replace(/\s*const resolvedParams = await params;\n/g, '');
  
  // Fix the function signatures and parameter usage properly
  content = content.replace(
    /(\w+):\s*NextRequest,\s*{ params }: { params: Promise<[^>]+> }\s*\)\s*{\s*try\s*{\s*const\s*{\s*([^}]+)\s*}\s*=\s*params;/g,
    '$1: NextRequest,\n  { params }: { params: Promise<{ $2 }> }\n) {\n  try {\n    const { $2 } = await params;'
  );
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Fixed: ${filePath}`);
}

// Run fixes
filesToFix.forEach(fixRouteHandlerProper);
console.log('Route handlers properly fixed!');
