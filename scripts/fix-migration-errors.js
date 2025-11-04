/**
 * Fix Migration Script Errors
 * Fixes stray commas left by the migration script
 */

const fs = require('fs');
const path = require('path');

let stats = {
  total: 0,
  fixed: 0,
  errors: 0
};

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Pattern 1: Remove stray comma and closing braces after error handling
    // This pattern: ,\n        { status: error.statusCode }\n      );\n    }
    content = content.replace(/,\s*\n\s*\{\s*status:\s*error\.statusCode\s*\}\s*\n\s*\);\s*\n\s*\}/g, '');
    
    // Pattern 2: Fix missing imports - if file starts with export but has no imports
    if (content.match(/^(\s*\/\*\*[\s\S]*?\*\/\s*)?export\s+async\s+function/m) && 
        !content.includes('import') && 
        (content.includes('NextRequest') || content.includes('NextResponse'))) {
      
      const isAdmin = filePath.includes('/api/admin/');
      const isSeller = filePath.includes('/api/seller/');
      const requireFn = isAdmin ? 'requireAdmin' : (isSeller ? 'requireSeller' : 'requireAuthentication');
      
      // Find controller import if any
      let controllerImport = '';
      if (content.includes('Controller')) {
        const matches = content.match(/(\w+)Controller\./g);
        if (matches && matches.length > 0) {
          const controllerName = matches[0].replace('Controller.', '').replace('Controller', '');
          controllerImport = `\nimport { ${controllerName}Controller } from '../../_lib/controllers/${controllerName}.controller';`;
        }
      }
      
      const imports = `import { NextRequest, NextResponse } from 'next/server';${controllerImport}
import { ${requireFn} } from '../../_lib/auth/session-middleware';\n\n`;
      
      // Add imports at the beginning, after any header comment
      const headerMatch = content.match(/^(\/\*\*[\s\S]*?\*\/\s*\n)/);
      if (headerMatch) {
        content = headerMatch[0] + imports + content.slice(headerMatch[0].length);
      } else {
        content = imports + content;
      }
    }
    
    // Pattern 3: Fix duplicate authentication comments
    content = content.replace(/\/\/ Verify admin authentication\s*\n\s*\/\/ Verify authentication using session/g, '// Verify authentication using session');
    content = content.replace(/\/\/ Verify seller authentication\s*\n\s*\/\/ Verify authentication using session/g, '// Verify authentication using session');
    
    // Pattern 4: Replace requireAuthentication with correct function for admin/seller routes
    const isAdmin = filePath.includes('/api/admin/');
    const isSeller = filePath.includes('/api/seller/');
    if (isAdmin && content.includes('requireAuthentication')) {
      content = content.replace(/requireAuthentication/g, 'requireAdmin');
    } else if (isSeller && content.includes('requireAuthentication')) {
      content = content.replace(/requireAuthentication/g, 'requireSeller');
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      stats.fixed++;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    stats.errors++;
    return false;
  }
}

function findApiFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findApiFiles(filePath, fileList);
    } else if (file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function main() {
  console.log('\n🔧 Fixing Migration Script Errors...\n');
  
  const apiDir = path.join(process.cwd(), 'src', 'app', '(backend)', 'api');
  const files = findApiFiles(apiDir);
  stats.total = files.length;
  
  console.log(`Found ${files.length} TypeScript files\n`);
  
  files.forEach(file => {
    fixFile(file);
  });
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📊 Fix Summary:`);
  console.log(`  Total files: ${stats.total}`);
  console.log(`  ✅ Fixed: ${stats.fixed}`);
  console.log(`  ❌ Errors: ${stats.errors}\n`);
}

main();
