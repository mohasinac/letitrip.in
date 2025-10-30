const fs = require("fs");
const path = require("path");

function findFiles(dir, pattern) {
  const results = [];

  function walk(directory) {
    try {
      const files = fs.readdirSync(directory);
      for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (pattern.test(file)) {
          results.push(fullPath);
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${directory}:`, err.message);
    }
  }

  walk(dir);
  return results;
}

function migrateAuthFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");

    // Skip if already migrated
    if (
      content.includes("createAdminHandler") ||
      content.includes("createSellerHandler") ||
      content.includes("createUserHandler") ||
      content.includes("createOptionalAuthHandler")
    ) {
      console.log(`✓ Already migrated: ${filePath}`);
      return;
    }

    // Skip if no auth required
    if (!content.includes("getCurrentUser") && !content.includes("withAuth")) {
      console.log(`- No auth required: ${filePath}`);
      return;
    }

    let modified = false;

    // Determine auth level needed based on file path
    let handlerType = "createUserHandler";
    if (filePath.includes("/admin/")) {
      handlerType = "createAdminHandler";
    } else if (filePath.includes("/seller/")) {
      handlerType = "createSellerHandler";
    }

    // Replace imports
    const oldImports = [
      "import { getCurrentUser } from '@/lib/auth/jwt';",
      'import { getCurrentUser } from "@/lib/auth/jwt";',
      "import { withAuth } from '@/lib/auth/middleware';",
      'import { withAuth } from "@/lib/auth/middleware";',
      "import { ApiResponse, withAuth } from '@/lib/auth/middleware';",
    ];

    for (const oldImport of oldImports) {
      if (content.includes(oldImport)) {
        content = content.replace(
          oldImport,
          `import { ${handlerType} } from "@/lib/auth/api-middleware";`,
        );
        modified = true;
        break;
      }
    }

    // Add NextResponse import if not present and needed
    if (!content.includes("NextResponse")) {
      content = content.replace(
        "import { NextRequest",
        "import { NextRequest, NextResponse",
      );
    }

    // Replace function exports with handler wrappers
    const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

    for (const method of httpMethods) {
      // Pattern: export async function METHOD(request: NextRequest)
      const functionPattern = new RegExp(
        `export\\s+async\\s+function\\s+${method}\\s*\\(\\s*request:\\s*NextRequest[^{]*\\)\\s*{`,
        "g",
      );

      if (functionPattern.test(content)) {
        // Replace with handler wrapper
        content = content.replace(
          functionPattern,
          `export const ${method} = ${handlerType}(async (request: NextRequest, user) => {`,
        );

        // Remove auth checks from inside the function
        content = content.replace(
          /const\s+user\s*=\s*await\s+getCurrentUser\(\)\s*;?\s*/g,
          "",
        );

        content = content.replace(/if\s*\(\s*!user[^}]+}\s*/g, "");

        // Add closing parenthesis for handler wrapper
        const lastBraceIndex = content.lastIndexOf("}");
        if (lastBraceIndex !== -1) {
          content =
            content.substring(0, lastBraceIndex) +
            "});" +
            content.substring(lastBraceIndex + 1);
        }

        modified = true;
      }

      // Pattern: export const METHOD = withAuth(...)
      const withAuthPattern = new RegExp(
        `export\\s+const\\s+${method}\\s*=\\s*withAuth\\s*\\(`,
        "g",
      );

      if (withAuthPattern.test(content)) {
        content = content.replace(
          withAuthPattern,
          `export const ${method} = ${handlerType}(`,
        );
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✓ Migrated: ${filePath}`);
    } else {
      console.log(`- No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error migrating ${filePath}:`, error.message);
  }
}

// Main execution
const apiDir = "./src/app/api";
const routeFiles = findFiles(apiDir, /route\.ts$/);

console.log(`Found ${routeFiles.length} route files to check...`);
console.log("");

for (const file of routeFiles) {
  migrateAuthFile(file);
}

console.log("");
console.log("Migration complete!");
