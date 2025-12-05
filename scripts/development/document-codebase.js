/**
 * Comprehensive Codebase Documentation Script
 * 
 * This script adds comprehensive JSDoc documentation to all TypeScript/JavaScript files:
 * - Functions (regular, arrow, async, generators)
 * - Classes and methods
 * - Interfaces and types
 * - Constants and enums
 * - Properties and parameters
 * 
 * @usage node scripts/development/document-codebase.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  rootDir: path.join(__dirname, '..', '..', 'src'),
  excludeDirs: ['node_modules', '.next', 'dist', 'build', 'coverage', '.git', 'out'],
  fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  skipPatterns: ['.test.', '.spec.', '__tests__'],
};

// Statistics tracking
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  functionsDocumented: 0,
  arrowFunctionsDocumented: 0,
  classesDocumented: 0,
  interfacesDocumented: 0,
  typesDocumented: 0,
  constantsDocumented: 0,
  enumsDocumented: 0,
  propertiesDocumented: 0,
  paramsAdded: 0,
  returnsAdded: 0,
  examplesAdded: 0,
  errors: 0,
};

/**
 * Check if directory should be excluded
 */
function shouldExcludeDir(dirPath) {
  const parts = dirPath.split(path.sep);
  return CONFIG.excludeDirs.some(excluded => parts.includes(excluded));
}

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  if (!CONFIG.fileExtensions.includes(ext)) return false;
  
  const basename = path.basename(filePath);
  return !CONFIG.skipPatterns.some(pattern => basename.includes(pattern));
}

/**
 * Get all TypeScript/JavaScript files recursively
 */
function getAllFiles(dir, fileList = []) {
  if (shouldExcludeDir(dir)) return fileList;

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (shouldProcessFile(filePath)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Extract parameters from function signature
 */
function extractParams(signature) {
  const params = [];
  
  // Match parameters between parentheses
  const paramMatch = signature.match(/\(([\s\S]*?)\)/);
  if (!paramMatch) return params;
  
  const paramStr = paramMatch[1];
  if (!paramStr.trim()) return params;
  
  // Handle destructured parameters
  let depth = 0;
  let current = '';
  
  for (let i = 0; i < paramStr.length; i++) {
    const char = paramStr[i];
    
    if (char === '{' || char === '[') depth++;
    if (char === '}' || char === ']') depth--;
    
    if (char === ',' && depth === 0) {
      if (current.trim()) params.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current.trim()) params.push(current.trim());
  
  return params.map(param => {
    // Extract name and type
    const cleanParam = param.replace(/\/\*[\s\S]*?\*\//g, '').trim();
    
    // Handle destructured params
    if (cleanParam.startsWith('{') || cleanParam.startsWith('[')) {
      const typeMatch = cleanParam.match(/[}\]]\s*:\s*([^=]+)/);
      const type = typeMatch ? typeMatch[1].trim() : 'object';
      return {
        name: cleanParam.split(':')[0].trim(),
        type,
        optional: cleanParam.includes('?') || cleanParam.includes('='),
      };
    }
    
    // Regular params
    const parts = cleanParam.split(':');
    const name = parts[0].replace(/[?\s]/g, '');
    const typeAndDefault = parts[1] || 'any';
    const type = typeAndDefault.split('=')[0].trim();
    const optional = cleanParam.includes('?') || cleanParam.includes('=');
    
    return { name, type, optional };
  });
}

/**
 * Infer return type from function signature
 */
function inferReturnType(signature) {
  // Check for explicit return type
  const returnMatch = signature.match(/\):\s*([^{]+)/);
  if (returnMatch) {
    return returnMatch[1].trim();
  }
  
  // Check for async
  if (signature.includes('async')) {
    return 'Promise<any>';
  }
  
  // Check for generator
  if (signature.includes('function*')) {
    return 'Generator';
  }
  
  return 'any';
}

/**
 * Generate intelligent description based on function name
 */
function generateDescription(name, signature) {
  const lowerName = name.toLowerCase();
  
  // React hooks
  if (name.startsWith('use')) {
    return `Custom React hook for ${name.slice(3).replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  }
  
  // Common patterns
  if (lowerName.startsWith('get')) return `Retrieves ${name.slice(3).replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  if (lowerName.startsWith('set')) return `Sets ${name.slice(3).replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  if (lowerName.startsWith('is')) return `Checks if ${name.slice(2).replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  if (lowerName.startsWith('has')) return `Checks if has ${name.slice(3).replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  if (lowerName.startsWith('handle')) return `Handles ${name.slice(6).replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  if (lowerName.startsWith('on')) return `Event handler for ${name.slice(2).replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  if (lowerName.startsWith('create')) return `Creates ${name.slice(6).replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  if (lowerName.startsWith('update')) return `Updates ${name.slice(6).replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  if (lowerName.startsWith('delete')) return `Deletes ${name.slice(6).replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  if (lowerName.startsWith('fetch')) return `Fetches ${name.slice(5).replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  if (lowerName.startsWith('render')) return `Renders ${name.slice(6).replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  if (lowerName.startsWith('validate')) return `Validates ${name.slice(8).replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  if (lowerName.startsWith('format')) return `Formats ${name.slice(6).replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  if (lowerName.startsWith('parse')) return `Parses ${name.slice(5).replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  if (lowerName.startsWith('transform')) return `Transforms ${name.slice(9).replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  if (lowerName.startsWith('calculate')) return `Calculates ${name.slice(9).replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  if (lowerName.startsWith('build')) return `Builds ${name.slice(5).replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  
  // React components
  if (/^[A-Z]/.test(name) && signature.includes('React')) {
    return `${name} component`;
  }
  
  // Default
  return `Performs ${name.replace(/([A-Z])/g, ' $1').toLowerCase().trim()} operation`;
}

/**
 * Generate example code
 */
function generateExample(name, params, isExported) {
  if (!isExported) return null;
  
  const paramList = params.map(p => {
    if (p.type === 'string') return '"example"';
    if (p.type === 'number') return '123';
    if (p.type === 'boolean') return 'true';
    if (p.type.includes('[]')) return '[]';
    if (p.type.includes('object') || p.type.includes('{')) return '{}';
    return p.name;
  }).join(', ');
  
  return `${name}(${paramList})`;
}

/**
 * Check if function/class already has documentation
 */
function hasDocumentation(content, startPos) {
  const before = content.substring(Math.max(0, startPos - 500), startPos);
  const lines = before.split('\n').reverse();
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('/**')) return true;
    if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*')) break;
  }
  
  return false;
}

/**
 * Add file header documentation
 */
function addFileHeader(content, filePath) {
  if (content.includes('@fileoverview')) return content;
  
  const relativePath = path.relative(CONFIG.rootDir, filePath).replace(/\\/g, '/');
  const ext = path.extname(filePath);
  const fileType = ext === '.tsx' || ext === '.jsx' ? 'React Component' : 'TypeScript Module';
  
  const header = `/**
 * @fileoverview ${fileType}
 * @module ${relativePath.replace(/\.(ts|tsx|js|jsx)$/, '')}
 * @description This file contains functionality related to ${path.basename(filePath, ext)}
 * 
 * @created ${new Date().toISOString().split('T')[0]}
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

`;
  
  // Skip shebang if present
  if (content.startsWith('#!')) {
    const firstNewline = content.indexOf('\n');
    return content.substring(0, firstNewline + 1) + header + content.substring(firstNewline + 1);
  }
  
  return header + content;
}

/**
 * Document regular functions
 */
function documentFunctions(content) {
  let modified = content;
  const functionRegex = /(?:export\s+)?(?:async\s+)?function\s*\*?\s+(\w+)\s*(<[^>]*>)?\s*(\([^)]*\))\s*(?::\s*([^{]+))?\s*{/g;
  let match;
  
  while ((match = functionRegex.exec(content)) !== null) {
    if (hasDocumentation(content, match.index)) continue;
    
    const [fullMatch, name, generics, paramsStr, returnType] = match;
    const signature = fullMatch;
    const params = extractParams(signature);
    const returnTypeValue = inferReturnType(signature);
    const description = generateDescription(name, signature);
    const isExported = signature.includes('export');
    const example = generateExample(name, params, isExported);
    
    const paramDocs = params.map(p => 
      ` * @param {${p.type}} ${p.optional ? `[${p.name}]` : p.name} - The ${p.name.toLowerCase()}`
    ).join('\n');
    
    const doc = `/**
 * ${description}
 *
${paramDocs ? paramDocs + '\n *\n' : ''} * @returns {${returnTypeValue}} The ${name.toLowerCase()} result
 *${example ? `\n * @example\n * ${example};\n` : '\n'} */
`;
    
    modified = modified.substring(0, match.index) + doc + modified.substring(match.index);
    functionRegex.lastIndex = match.index + doc.length + fullMatch.length;
    
    stats.functionsDocumented++;
    stats.paramsAdded += params.length;
    stats.returnsAdded++;
    if (example) stats.examplesAdded++;
  }
  
  return modified;
}

/**
 * Document arrow functions
 */
function documentArrowFunctions(content) {
  let modified = content;
  const arrowRegex = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*(?::\s*[^=]+)?\s*=\s*(?:async\s+)?(\([^)]*\)|[^=]+)\s*=>\s*({|[^{])/g;
  let match;
  
  while ((match = arrowRegex.exec(content)) !== null) {
    if (hasDocumentation(content, match.index)) continue;
    
    const [fullMatch, name, paramsStr] = match;
    const signature = fullMatch;
    const params = extractParams(signature);
    const returnType = inferReturnType(signature);
    const description = generateDescription(name, signature);
    const isExported = signature.includes('export');
    const example = generateExample(name, params, isExported);
    
    const paramDocs = params.map(p => 
      ` * @param {${p.type}} ${p.optional ? `[${p.name}]` : p.name} - The ${p.name.toLowerCase()}`
    ).join('\n');
    
    const doc = `/**
 * ${description}
 *
${paramDocs ? paramDocs + '\n *\n' : ''} * @returns {${returnType}} The ${name.toLowerCase()} result
 *${example ? `\n * @example\n * ${example};\n` : '\n'} */
`;
    
    modified = modified.substring(0, match.index) + doc + modified.substring(match.index);
    arrowRegex.lastIndex = match.index + doc.length + fullMatch.length;
    
    stats.arrowFunctionsDocumented++;
    stats.paramsAdded += params.length;
    stats.returnsAdded++;
    if (example) stats.examplesAdded++;
  }
  
  return modified;
}

/**
 * Document classes
 */
function documentClasses(content) {
  let modified = content;
  const classRegex = /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?(?:\s+implements\s+[\w,\s]+)?\s*{/g;
  let match;
  
  while ((match = classRegex.exec(content)) !== null) {
    if (hasDocumentation(content, match.index)) continue;
    
    const [fullMatch, name] = match;
    
    const doc = `/**
 * ${name} class
 * 
 * @class
 * @description Represents a ${name}
 */
`;
    
    modified = modified.substring(0, match.index) + doc + modified.substring(match.index);
    classRegex.lastIndex = match.index + doc.length + fullMatch.length;
    
    stats.classesDocumented++;
  }
  
  return modified;
}

/**
 * Document interfaces
 */
function documentInterfaces(content) {
  let modified = content;
  const interfaceRegex = /(?:export\s+)?interface\s+(\w+)(?:\s+extends\s+[\w,\s]+)?\s*{/g;
  let match;
  
  while ((match = interfaceRegex.exec(content)) !== null) {
    if (hasDocumentation(content, match.index)) continue;
    
    const [fullMatch, name] = match;
    
    const doc = `/**
 * ${name} interface
 * 
 * @interface
 * @description Defines the structure and contract for ${name}
 */
`;
    
    modified = modified.substring(0, match.index) + doc + modified.substring(match.index);
    interfaceRegex.lastIndex = match.index + doc.length + fullMatch.length;
    
    stats.interfacesDocumented++;
  }
  
  return modified;
}

/**
 * Document type aliases
 */
function documentTypes(content) {
  let modified = content;
  const typeRegex = /(?:export\s+)?type\s+(\w+)(?:<[^>]+>)?\s*=\s*[^;]+;/g;
  let match;
  
  while ((match = typeRegex.exec(content)) !== null) {
    if (hasDocumentation(content, match.index)) continue;
    
    const [fullMatch, name] = match;
    
    const doc = `/**
 * ${name} type
 * 
 * @typedef {Object} ${name}
 * @description Type definition for ${name}
 */
`;
    
    modified = modified.substring(0, match.index) + doc + modified.substring(match.index);
    typeRegex.lastIndex = match.index + doc.length + fullMatch.length;
    
    stats.typesDocumented++;
  }
  
  return modified;
}

/**
 * Document constants
 */
function documentConstants(content) {
  let modified = content;
  const constRegex = /(?:export\s+)?const\s+([A-Z_][A-Z0-9_]*)\s*(?::\s*[^=]+)?\s*=\s*(?![(\w])[^;]+;/g;
  let match;
  
  while ((match = constRegex.exec(content)) !== null) {
    if (hasDocumentation(content, match.index)) continue;
    
    const [fullMatch, name] = match;
    
    const doc = `/**
 * ${name} constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for ${name.toLowerCase().replace(/_/g, ' ')}
 */
`;
    
    modified = modified.substring(0, match.index) + doc + modified.substring(match.index);
    constRegex.lastIndex = match.index + doc.length + fullMatch.length;
    
    stats.constantsDocumented++;
  }
  
  return modified;
}

/**
 * Document enums
 */
function documentEnums(content) {
  let modified = content;
  const enumRegex = /(?:export\s+)?enum\s+(\w+)\s*{/g;
  let match;
  
  while ((match = enumRegex.exec(content)) !== null) {
    if (hasDocumentation(content, match.index)) continue;
    
    const [fullMatch, name] = match;
    
    const doc = `/**
 * ${name} enum
 * 
 * @enum
 * @description Enumeration for ${name}
 */
`;
    
    modified = modified.substring(0, match.index) + doc + modified.substring(match.index);
    enumRegex.lastIndex = match.index + doc.length + fullMatch.length;
    
    stats.enumsDocumented++;
  }
  
  return modified;
}

/**
 * Document interface/type properties
 */
function documentProperties(content) {
  let modified = content;
  const lines = content.split('\n');
  let inInterface = false;
  let inType = false;
  let result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check if entering interface or type
    if (/(?:interface|type)\s+\w+/.test(trimmed)) {
      inInterface = true;
      result.push(line);
      continue;
    }
    
    // Check if exiting
    if (inInterface && trimmed === '}') {
      inInterface = false;
      inType = false;
      result.push(line);
      continue;
    }
    
    // Document properties inside interfaces/types
    if (inInterface && /^\s*(\w+)(\?)?:\s*/.test(line)) {
      const propMatch = line.match(/^\s*(\w+)(\?)?:/);
      if (propMatch) {
        const propName = propMatch[1];
        const prevLine = result[result.length - 1];
        
        // Only add comment if not already documented
        if (!prevLine || !prevLine.trim().startsWith('/**')) {
          const indent = line.match(/^\s*/)[0];
          result.push(`${indent}/** ${propName.charAt(0).toUpperCase() + propName.slice(1)} */`);
          stats.propertiesDocumented++;
        }
      }
    }
    
    result.push(line);
  }
  
  return result.join('\n');
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    stats.filesProcessed++;
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Add file header
    content = addFileHeader(content, filePath);
    
    // Document different code elements
    content = documentFunctions(content);
    content = documentArrowFunctions(content);
    content = documentClasses(content);
    content = documentInterfaces(content);
    content = documentTypes(content);
    content = documentConstants(content);
    content = documentEnums(content);
    content = documentProperties(content);
    
    // Write back if modified
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesModified++;
      console.log(`✅ Enhanced: ${filePath}`);
    }
  } catch (error) {
    stats.errors++;
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('📝 Starting comprehensive codebase documentation...\n');
  
  const files = getAllFiles(CONFIG.rootDir);
  
  files.forEach((file, index) => {
    processFile(file);
    
    if ((index + 1) % 100 === 0) {
      console.log(`📝 Progress: ${index + 1} files, ${stats.functionsDocumented} functions`);
    }
  });
  
  // Print summary
  console.log('\n======================================================================');
  console.log('✅ Comprehensive Documentation Complete!');
  console.log('======================================================================');
  console.log(`Files Processed:        ${stats.filesProcessed}`);
  console.log(`Files Modified:         ${stats.filesModified}`);
  console.log(`Functions Documented:   ${stats.functionsDocumented}`);
  console.log(`Arrow Functions:        ${stats.arrowFunctionsDocumented}`);
  console.log(`Classes Documented:     ${stats.classesDocumented}`);
  console.log(`Interfaces Documented:  ${stats.interfacesDocumented}`);
  console.log(`Types Documented:       ${stats.typesDocumented}`);
  console.log(`Constants Documented:   ${stats.constantsDocumented}`);
  console.log(`Enums Documented:       ${stats.enumsDocumented}`);
  console.log(`Properties Documented:  ${stats.propertiesDocumented}`);
  console.log(`Parameters Added:       ${stats.paramsAdded}`);
  console.log(`Returns Added:          ${stats.returnsAdded}`);
  console.log(`Examples Added:         ${stats.examplesAdded}`);
  console.log(`Errors:                 ${stats.errors}`);
  console.log('======================================================================');
}

// Run the script
main();
