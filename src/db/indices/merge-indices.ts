/**
 * Index Merger Utility
 * 
 * Merges all individual index files into a single firestore.indexes.json
 */

import fs from 'fs';
import path from 'path';

interface IndexConfig {
  indexes: any[];
  fieldOverrides: any[];
}

/**
 * Merge all index JSON files into a single configuration
 */
export function mergeIndices(indexDir: string = __dirname): IndexConfig {
  const mergedConfig: IndexConfig = {
    indexes: [],
    fieldOverrides: [],
  };

  const files = fs.readdirSync(indexDir);
  
  for (const file of files) {
    if (file.endsWith('.index.json')) {
      const filePath = path.join(indexDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const config = JSON.parse(content) as IndexConfig;
      
      mergedConfig.indexes.push(...config.indexes);
      mergedConfig.fieldOverrides.push(...config.fieldOverrides);
    }
  }

  return mergedConfig;
}

/**
 * Generate merged firestore.indexes.json file
 */
export function generateMergedIndexFile(
  indexDir: string = __dirname,
  outputPath: string = path.join(process.cwd(), 'firestore.indexes.json')
): void {
  const mergedConfig = mergeIndices(indexDir);
  fs.writeFileSync(outputPath, JSON.stringify(mergedConfig, null, 2));
  console.log(`✓ Generated merged index file: ${outputPath}`);
  console.log(`  - Total indexes: ${mergedConfig.indexes.length}`);
  console.log(`  - Total field overrides: ${mergedConfig.fieldOverrides.length}`);
}

// Run if executed directly
if (require.main === module) {
  generateMergedIndexFile();
}
