/**
 * Fix Script: Repair broken files from migration
 * This fixes syntax errors caused by overly aggressive regex replacement
 */

const fs = require('fs');
const path = require('path');

let fixCount = 0;
let errorCount = 0;

function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === 'route.ts') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixed = false;
    
    // Fix: Remove stray commas before return statements
    if (content.match(/\n\s*,\s*\n\s*\{\s*status:/)) {
      content = content.replace(/(\n\s*),(\s*\n\s*\{\s*status:)/g, '$1return NextResponse.json(\n      { success: false, error: error.message || \'Failed\' },$2');
      fixed = true;
    }
    
    // Fix: Ensure proper return statements in catch blocks
    content = content.replace(
      /} catch \(error: any\) \{[\s\S]*?console\.error\([^)]+\);[\s\S]*?,[\s\s]*\{\s*status:/g,
      (match) => {
        if (!match.includes('return NextResponse.json')) {
          return match.replace(',\n', '\n\n    return NextResponse.json(\n      { success: false, error: error.message || \'Failed\' },\n');
        }
        return match;
      }
    );
    
    // Fix: Remove duplicate closing braces
    content = content.replace(/\}\s*\}\s*\}/g, '}\n  }');
    
    // Fix: Clean up malformed catch blocks
    content = content.replace(
      /(} catch \(error: any\) \{\s*console\.error\([^)]+\);\s*)(,\s*\{\s*status:)/g,
      '$1\n\n    return NextResponse.json(\n      { success: false, error: error.message || \'Failed\' },$2'
    );
    
    // Validate that catch blocks have returns
    const catchBlocks = content.match(/} catch \(error: any\) \{[\s\S]*?\n\s*\}/g);
    if (catchBlocks) {
      catchBlocks.forEach(block => {
        if (!block.includes('return') && !block.includes('throw')) {
          console.warn(`⚠️  Warning: Catch block without return in ${filePath}`);
        }
      });
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      fixCount++;
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    errorCount++;
  }
}

function main() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║   🔧 Migration Fix Tool                           ║');
  console.log('║   Repairing syntax errors from migration         ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  
  const apiDir = path.join(process.cwd(), 'src', 'app', '(backend)', 'api');
  const routeFiles = findRouteFiles(apiDir);
  
  console.log(`Found ${routeFiles.length} route files\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  routeFiles.forEach(file => {
    fixFile(file);
  });
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n✅ Fixed ${fixCount} files`);
  console.log(`❌ Errors: ${errorCount}\n`);
}

main();
