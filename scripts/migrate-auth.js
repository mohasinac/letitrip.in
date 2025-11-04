/**
 * Migration Script: Convert Bearer Token Auth to Session Auth
 * Usage: node scripts/migrate-auth.js
 */

const fs = require('fs');
const path = require('path');

// Stats
let stats = {
  total: 0,
  updated: 0,
  skipped: 0,
  errors: 0
};

// Find all route.ts files in api directory
function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === 'route.ts' || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Determine correct import path for session middleware
function getSessionMiddlewareImportPath(filePath) {
  const relativePath = path.relative(
    path.dirname(filePath),
    path.join(process.cwd(), 'src', 'app', '(backend)', 'api', '_lib', 'auth', 'session-middleware.ts')
  );
  
  return relativePath.replace(/\\/g, '/').replace('.ts', '');
}

// Migrate a single file
function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Skip if already migrated
    if (content.includes('requireAdmin') || content.includes('requireSeller')) {
      console.log(`⏭️  Skipped (already migrated): ${filePath}`);
      stats.skipped++;
      return;
    }
    
    // Skip if doesn't use old auth
    if (!content.includes('getAdminAuth') && !content.includes('verifyIdToken') && !content.includes('Bearer')) {
      stats.skipped++;
      return;
    }
    
    console.log(`🔄 Processing: ${filePath}`);
    
    // Determine if this is admin or seller route
    const isAdmin = filePath.includes('/api/admin/');
    const isSeller = filePath.includes('/api/seller/');
    const requireFunction = isAdmin ? 'requireAdmin' : (isSeller ? 'requireSeller' : 'requireAuthentication');
    
    // Remove old imports
    content = content.replace(/import \{ getAdminAuth \} from ['"][^'"]+['"];?\r?\n?/g, '');
    content = content.replace(/import \{ getAdminAuth, getAdminDb \} from ['"][^'"]+['"];/g, "import { getAdminDb } from '../../_lib/database/admin';");
    content = content.replace(/import \{ getAdminAuth, getAdminDb, getAdminStorage \} from ['"][^'"]+['"];/g, "import { getAdminDb, getAdminStorage } from '../../../_lib/database/admin';");
    content = content.replace(/import \{ AuthorizationError \} from ['"][^'"]+['"];?\r?\n?/g, '');
    
    // Add session middleware import if not present
    if (!content.includes(requireFunction)) {
      const importPath = getSessionMiddlewareImportPath(filePath);
      const importStatement = `import { ${requireFunction} } from '${importPath}';\n`;
      
      // Add after existing imports
      const lastImportMatch = content.match(/import[^;]+;(?=\r?\n\r?\n)/g);
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        content = content.replace(lastImport, lastImport + '\n' + importStatement);
      } else {
        // Add at the beginning after file header comment
        const headerEnd = content.indexOf('\n\n');
        if (headerEnd > 0) {
          content = content.slice(0, headerEnd + 2) + importStatement + content.slice(headerEnd + 2);
        }
      }
    }
    
    // Remove verifyAdminAuth/verifySellerAuth function definitions
    content = content.replace(/\/\*\*[\s\S]*?\*\/\s*async function verify\w+Auth\(request: NextRequest\)\s*\{[\s\S]*?\n\}/g, '');
    
    // Replace auth verification calls - Pattern 1: const user = await verifyXAuth(request);
    const authCallPattern = /const (user|seller) = await verify\w+Auth\(request\);/g;
    const sessionReplacement = `// Verify authentication using session
    const sessionOrError = await ${requireFunction}(request);
    
    // If it's a NextResponse, it's an error response
    if (sessionOrError instanceof NextResponse) {
      return sessionOrError;
    }
    
    const session = sessionOrError;`;
    
    content = content.replace(authCallPattern, sessionReplacement);
    
    // Replace auth verification calls - Pattern 2: await verifyXAuth(request); (no assignment)
    const authCallPattern2 = /await verify\w+Auth\(request\);/g;
    content = content.replace(authCallPattern2, sessionReplacement);
    
    // Replace user/seller references in controller calls
    content = content.replace(/,\s*(user|seller)\)/g, `, {
      uid: session.userId,
      role: session.role,
      email: session.email || undefined,
    })`);
    
    // Remove AuthorizationError catch blocks
    content = content.replace(/if \(error instanceof AuthorizationError\) \{[\s\S]*?\}\s*/g, '');
    
    // Clean up multiple blank lines
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      stats.updated++;
    } else {
      console.log(`⚠️  No changes: ${filePath}`);
      stats.skipped++;
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    stats.errors++;
  }
}

// Main execution
function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   🚀 Session Authentication Migration Tool                ║');
  console.log('║   Converting Bearer Token Auth → Session-Based Auth       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const apiDir = path.join(process.cwd(), 'src', 'app', '(backend)', 'api');
  
  if (!fs.existsSync(apiDir)) {
    console.error('❌ API directory not found:', apiDir);
    process.exit(1);
  }
  
  console.log('📁 Scanning for API route files...\n');
  
  const routeFiles = findRouteFiles(apiDir);
  stats.total = routeFiles.length;
  
  console.log(`Found ${routeFiles.length} TypeScript files\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  routeFiles.forEach(file => {
    migrateFile(file);
  });
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📊 Migration Summary:');
  console.log(`  Total files scanned: ${stats.total}`);
  console.log(`  ✅ Updated: ${stats.updated}`);
  console.log(`  ⏭️  Skipped: ${stats.skipped}`);
  console.log(`  ❌ Errors: ${stats.errors}`);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (stats.updated > 0) {
    console.log('🎉 Migration completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('  1. Review the changes with: git diff');
    console.log('  2. Test your application thoroughly');
    console.log('  3. Check for any remaining 401/403 errors');
    console.log('  4. Commit if everything works\n');
  } else {
    console.log('ℹ️  No files needed updating.\n');
  }
}

// Run the migration
main();
