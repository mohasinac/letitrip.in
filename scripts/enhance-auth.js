const fs = require("fs");
const path = require("path");

// Routes that require authentication but might not have obvious patterns
const userRoutesRequiringAuth = [
  "src/app/api/user/addresses/route.ts",
  "src/app/api/user/addresses/[id]/route.ts",
  "src/app/api/user/wishlist/route.ts",
  "src/app/api/user/watchlist/route.ts",
  "src/app/api/user/bids/route.ts",
  "src/app/api/user/returns/route.ts",
  "src/app/api/user/theme-settings/route.ts",
  "src/app/api/user/dashboard/stats/route.ts",
];

const sellerRoutesRequiringAuth = [
  "src/app/api/seller/store-settings/route.ts",
  "src/app/api/seller/dashboard/stats/route.ts",
];

const adminRoutesRequiringAuth = [
  "src/app/api/admin/dashboard/stats/route.ts",
  "src/app/api/admin/cleanup/route.ts",
  "src/app/api/admin/initialize/route.ts",
];

function migrateRouteFile(filePath, handlerType) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`- File not found: ${filePath}`);
      return;
    }

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

    let modified = false;

    // Add import for the handler type
    if (
      !content.includes("createUserHandler") &&
      !content.includes("createAdminHandler") &&
      !content.includes("createSellerHandler")
    ) {
      // Add import at the top
      content = content.replace(
        'import { NextRequest, NextResponse } from "next/server";',
        `import { NextRequest, NextResponse } from "next/server";\nimport { ${handlerType} } from "@/lib/auth/api-middleware";`,
      );
      modified = true;
    }

    // Replace function exports with handler wrappers
    const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

    for (const method of httpMethods) {
      // Pattern: export async function METHOD(request: NextRequest)
      const functionPattern = new RegExp(
        `export\\s+async\\s+function\\s+${method}\\s*\\([^)]*\\)\\s*{`,
        "g",
      );

      const match = content.match(functionPattern);
      if (match) {
        content = content.replace(
          functionPattern,
          `export const ${method} = ${handlerType}(async (request: NextRequest, user) => {`,
        );

        // Find the matching closing brace and add });
        let braceCount = 0;
        let inFunction = false;
        let functionEnd = -1;

        for (let i = 0; i < content.length; i++) {
          if (
            !inFunction &&
            content
              .substring(i)
              .startsWith(
                `export const ${method} = ${handlerType}(async (request: NextRequest, user) => {`,
              )
          ) {
            inFunction = true;
            braceCount = 1;
            i +=
              `export const ${method} = ${handlerType}(async (request: NextRequest, user) => {`
                .length - 1;
            continue;
          }

          if (inFunction) {
            if (content[i] === "{") braceCount++;
            if (content[i] === "}") braceCount--;

            if (braceCount === 0) {
              functionEnd = i;
              break;
            }
          }
        }

        if (functionEnd !== -1) {
          content =
            content.substring(0, functionEnd) +
            "});" +
            content.substring(functionEnd + 1);
        }

        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✓ Enhanced: ${filePath}`);
    } else {
      console.log(`- No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error enhancing ${filePath}:`, error.message);
  }
}

// Process all user routes
console.log("Enhancing User Routes...");
userRoutesRequiringAuth.forEach((route) => {
  migrateRouteFile(route, "createUserHandler");
});

console.log("\nEnhancing Seller Routes...");
sellerRoutesRequiringAuth.forEach((route) => {
  migrateRouteFile(route, "createSellerHandler");
});

console.log("\nEnhancing Admin Routes...");
adminRoutesRequiringAuth.forEach((route) => {
  migrateRouteFile(route, "createAdminHandler");
});

console.log("\nEnhancement complete!");
