/**
 * Migration Script V2: Convert Bearer Token Auth to Session Auth
 * Improved version with better error handling and validation
 */

const fs = require('fs');
const path = require('path');

let stats = { total: 0, updated: 0, skipped: 0, errors: 0 };

function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === 'route.ts') {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function getImportPath(filePath) {
  const relativePath = path.relative(
    path.dirname(filePath),
    path.join(process.cwd(), 'src', 'app', '(backend)', 'api', '_lib', 'auth', 'session-middleware.ts')
  );
  return relativePath.replace(/\\/g, '/').replace('.ts', '');
}

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Skip if already migrated
    if (content.includes('requireAdmin') || content.includes('requireSeller') || content.includes('requireAuthentication')) {
      console.log(`⏭️  Skip: ${path.relative(process.cwd(), filePath)}`);
      stats.skipped++;
      return;
    }
    
    // Skip if no old auth
    if (!content.includes('Bearer') && !content.includes('verifyIdToken')) {
      stats.skipped++;
      return;
    }
    
    console.log(`🔄 Migrating: ${path.relative(process.cwd(), filePath)}`);
    
    // Determine auth type
    const isAdmin = filePath.includes('/api/admin/');
    const isSeller = filePath.includes('/api/seller/');
    const requireFn = isAdmin ? 'requireAdmin' : (isSeller ? 'requireSeller' : 'requireAuthentication');
    
    // Step 1: Add new import
    const importPath = getImportPath(filePath);
    const newImport = `import { ${requireFn} } from '${importPath}';\n`;
    
    // Find where to insert import (after last import statement)
    const importRegex = /^import\s+.+;\s*$/gm;
    const imports = content.match(importRegex);
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      content = content.slice(0, lastImportIndex + lastImport.length) + '\n' + newImport + content.slice(lastImportIndex + lastImport.length);
    }
    
    // Step 2: Remove old auth function (but preserve its body for reference)
    const authFuncRegex = /\/\*\*[\s\S]*?\*\/\s*async function verify\w+Auth\(request: NextRequest\)\s*\{[\s\S]*?\n\}/;
    content = content.replace(authFuncRegex, '');
    
    // Step 3: Replace auth calls in each function handler
    // Pattern: const user/seller = await verify...Auth(request);
    content = content.replace(
      /(\s+)const (user|seller|admin) = await verify\w+Auth\(request\);/g,
      `$1// Verify authentication using session\n$1const sessionOrError = await ${requireFn}(request);\n$1\n$1// If it's a NextResponse, it's an error response\n$1if (sessionOrError instanceof NextResponse) {\n$1  return sessionOrError;\n$1}\n$1\n$1const session = sessionOrError;`
    );
    
    // Step 4: Replace user/seller/admin variable references in controller calls
    content = content.replace(
      /,\s*(user|seller|admin)\s*\)/g,
      `, {\n      uid: session.userId,\n      role: session.role,\n      email: session.email || undefined,\n    })`
    );
    
    // Step 5: Clean up old imports
    content = content.replace(/import\s+\{\s*getAdminAuth\s*\}\s+from\s+['"][^'"]+['"];\s*\n/g, '');
    content = content.replace(/import\s+\{\s*AuthorizationError\s*\}\s+from\s+['"][^'"]+['"];\s*\n/g, '');
    
    // Update getAdminAuth imports to only keep getAdminDb
    content = content.replace(
      /import\s+\{\s*getAdminAuth,\s*getAdminDb\s*\}\s+from\s+(['"][^'"]+['"]);\s*\n/g,
      'import { getAdminDb } from $1;\n'
    );
    content = content.replace(
      /import\s+\{\s*getAdminAuth,\s*getAdminDb,\s*getAdminStorage\s*\}\s+from\s+(['"][^'"]+['"]);\s*\n/g,
      'import { getAdminDb, getAdminStorage } from $1;\n'
    );
    
    // Step 6: Remove AuthorizationError catch blocks carefully
    // Find and replace specific pattern
    content = content.replace(
      /if \(error instanceof AuthorizationError\) \{\s*return NextResponse\.json\(\s*\{\s*success:\s*false,\s*error:\s*error\.message\s*\},\s*\{\s*status:\s*error\.statusCode\s*\}\s*\);\s*\}\s*/g,
      ''
    );
    
    // Step 7: Clean up extra blank lines
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // Validate the result
    try {
      // Check for syntax issues
      if (content.includes(',,') || content.match(/\n\s*,\s*\n/)) {
        throw new Error('Syntax error detected: stray commas');
      }
      
      // Check for incomplete replacements
      if (content.includes('verifyAdminAuth') || content.includes('verifySellerAuth')) {
        throw new Error('Incomplete migration: old auth functions still present');
      }
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
      stats.updated++;
      
    } catch (validationError) {
      console.error(`❌ Validation failed for ${filePath}:`, validationError.message);
      // Restore original content
      fs.writeFileSync(filePath, original, 'utf8');
      stats.errors++;
    }
    
  } catch (error) {
    console.error(`❌ Error: ${path.relative(process.cwd(), filePath)}:`, error.message);
    stats.errors++;
  }
}

function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   🚀 Session Auth Migration V2                      ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');
  
  const apiDir = path.join(process.cwd(), 'src', 'app', '(backend)', 'api');
  const routeFiles = findRouteFiles(apiDir);
  stats.total = routeFiles.length;
  
  console.log(`Found ${routeFiles.length} route files\n`);
  
  routeFiles.forEach(migrateFile);
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📊 Summary:`);
  console.log(`  Total: ${stats.total}`);
  console.log(`  ✅ Updated: ${stats.updated}`);
  console.log(`  ⏭️  Skipped: ${stats.skipped}`);
  console.log(`  ❌ Errors: ${stats.errors}\n`);
  
  if (stats.errors > 0) {
    console.log('⚠️  Some files had errors and were not migrated.\n');
    process.exit(1);
  } else if (stats.updated > 0) {
    console.log('🎉 Migration completed! Run "npm run build" to test.\n');
  }
}

main();
