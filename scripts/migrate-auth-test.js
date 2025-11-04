/**
 * Migration Script V2 - Test Run
 * Test on admin/users routes only
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
      console.log(`⏭️  Skip: ${path.relative(process.cwd(), filePath)} - Already migrated`);
      stats.skipped++;
      return;
    }
    
    // Skip if no old auth
    if (!content.includes('Bearer') && !content.includes('verifyIdToken')) {
      console.log(`⏭️  Skip: ${path.relative(process.cwd(), filePath)} - No auth to migrate`);
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
    const newImport = `import { ${requireFn} } from '${importPath}';`;
    
    // Find where to insert import (after last import statement)
    const importRegex = /^import\s+.+?;/gm;
    const imports = content.match(importRegex);
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      content = content.slice(0, lastImportIndex + lastImport.length) + '\n' + newImport + content.slice(lastImportIndex + lastImport.length);
    }
    
    // Step 2: Remove old auth function
    const authFuncPattern = /\/\*\*[\s\S]*?\*\/\s*async function verify\w+Auth\(request: NextRequest\)\s*\{[\s\S]*?\n\}/;
    content = content.replace(authFuncPattern, '');
    
    // Step 3: Replace auth calls in handler functions
    // Match: const user/seller/admin = await verify...Auth(request);
    const authCallPattern = /(\s+)const (user|seller|admin) = await verify\w+Auth\(request\);/g;
    content = content.replace(authCallPattern, (match, indent, varName) => {
      return `${indent}// Verify authentication using session
${indent}const sessionOrError = await ${requireFn}(request);
${indent}
${indent}// If it's a NextResponse, it's an error response
${indent}if (sessionOrError instanceof NextResponse) {
${indent}  return sessionOrError;
${indent}}
${indent}
${indent}const session = sessionOrError;`;
    });
    
    // Step 4: Replace user/seller/admin usage in controller calls
    // Look for pattern: controller.method(..., user)
    content = content.replace(/,\s*(user|seller|admin)\s*\)/g, (match, varName) => {
      return `, {
      uid: session.userId,
      role: session.role,
      email: session.email || undefined,
    })`;
    });
    
    // Step 5: Clean up old imports
    content = content.replace(/import\s+\{\s*getAdminAuth\s*\}\s+from\s+['"][^'"]+['"];\s*\n/g, '');
    content = content.replace(/import\s+\{\s*AuthorizationError\s*\}\s+from\s+['"][^'"]+['"];\s*\n/g, '');
    
    // Update combined imports
    content = content.replace(
      /import\s+\{\s*getAdminAuth,\s*getAdminDb\s*\}\s+from\s+(['"][^'"]+['"]);\s*\n/g,
      'import { getAdminDb } from $1;\n'
    );
    content = content.replace(
      /import\s+\{\s*getAdminAuth,\s*getAdminDb,\s*getAdminStorage\s*\}\s+from\s+(['"][^'"]+['"]);\s*\n/g,
      'import { getAdminDb, getAdminStorage } from $1;\n'
    );
    
    // Step 6: Remove AuthorizationError catch blocks
    // Be very careful - only remove the if block, not the entire catch
    const authErrorPattern = /\s*if \(error instanceof AuthorizationError\) \{\s*return NextResponse\.json\(\s*\{\s*success:\s*false,\s*error:\s*error\.message\s*\},\s*\{\s*status:\s*error\.statusCode\s*\}\s*\);\s*\}\s*/g;
    content = content.replace(authErrorPattern, '\n');
    
    // Step 7: Clean up extra blank lines (max 2 consecutive)
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // Validate the result
    try {
      // Check for syntax issues
      if (content.includes(',,')) {
        throw new Error('Syntax error: double commas detected');
      }
      
      if (content.match(/\{\s*,/)) {
        throw new Error('Syntax error: comma after opening brace');
      }
      
      if (content.match(/\n\s*,\s*\n/)) {
        throw new Error('Syntax error: stray comma on its own line');
      }
      
      // Check for incomplete replacements
      if (content.includes('verifyAdminAuth') || content.includes('verifySellerAuth')) {
        throw new Error('Incomplete migration: old auth functions still referenced');
      }
      
      // Check for old imports still present
      if (content.includes('getAdminAuth')) {
        throw new Error('Old import getAdminAuth still present');
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
  console.log('║   🧪 Test Migration - admin/users only              ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');
  
  // Test on admin/users only
  const testDir = path.join(process.cwd(), 'src', 'app', '(backend)', 'api', 'admin', 'users');
  const routeFiles = findRouteFiles(testDir);
  stats.total = routeFiles.length;
  
  console.log(`Found ${routeFiles.length} route files in admin/users\n`);
  
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
    console.log('🎉 Test migration completed! Check the files and run "npm run build" to test.\n');
  } else {
    console.log('ℹ️  No files needed migration.\n');
  }
}

main();
