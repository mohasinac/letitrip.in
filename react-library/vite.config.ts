import react from "@vitejs/plugin-react";
import { copyFileSync, mkdirSync, readdirSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// Plugin to copy CSS token files to dist
function copyTokens() {
  return {
    name: "copy-tokens",
    closeBundle() {
      const tokensDir = resolve(__dirname, "src/styles/tokens");
      const distTokensDir = resolve(__dirname, "dist/styles/tokens");

      // Create dist/styles/tokens directory
      mkdirSync(distTokensDir, { recursive: true });

      // Copy all CSS files
      const files = readdirSync(tokensDir);
      files.forEach((file) => {
        if (file.endsWith(".css")) {
          copyFileSync(resolve(tokensDir, file), resolve(distTokensDir, file));
        }
      });

      console.log(
        `✓ Copied ${
          files.filter((f) => f.endsWith(".css")).length
        } CSS token files to dist/styles/tokens`,
      );
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ["src/**/*"],
      exclude: ["src/**/*.stories.tsx", "src/**/*.test.tsx"],
    }),
    copyTokens(),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "utils/index": resolve(__dirname, "src/utils/index.ts"),
        "components/index": resolve(__dirname, "src/components/index.ts"),
        "hooks/index": resolve(__dirname, "src/hooks/index.ts"),
        "styles/index": resolve(__dirname, "src/styles/index.ts"),
        "types/index": resolve(__dirname, "src/types/index.ts"),
      },
      name: "LetitripReactLibrary",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      // External dependencies that should not be bundled
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "date-fns",
        "clsx",
        "tailwind-merge",
        "libphonenumber-js",
      ],
      output: {
        banner: (chunk) => {
          // Add "use client" directive to all chunks
          return '"use client";';
        },
        // Global variables for UMD/IIFE builds
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
          "date-fns": "dateFns",
          clsx: "clsx",
          "tailwind-merge": "tailwindMerge",
          "libphonenumber-js": "libphonenumberJs",
        },
        // Optimize chunk splitting for better tree-shaking
        manualChunks: undefined, // Let Rollup decide optimal chunks
        // Preserve module structure for better tree-shaking
        preserveModules: false,
        // Use compact output for smaller bundle size
        compact: true,
        // Code splitting optimization
        chunkFileNames: (chunkInfo) => {
          // Group related chunks together
          const name = chunkInfo.name;
          if (name.includes("node_modules")) {
            return "vendor/[name]-[hash].js";
          }
          if (name.includes("components")) {
            return "chunks/components/[name]-[hash].js";
          }
          if (name.includes("utils")) {
            return "chunks/utils/[name]-[hash].js";
          }
          if (name.includes("hooks")) {
            return "chunks/hooks/[name]-[hash].js";
          }
          return "chunks/[name]-[hash].js";
        },
      },
    },
    // Minification and optimization
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for debugging
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ["console.debug"], // Remove console.debug calls
        passes: 2, // Run compression twice for better results
      },
      mangle: {
        safari10: true, // Safari 10 compatibility
      },
      format: {
        comments: false, // Remove comments
        ecma: 2020, // Target ES2020
      },
    },
    // Source map generation
    sourcemap: true,
    // Target modern browsers for smaller bundle
    target: "es2020",
    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: true,
    // Report bundle size
    reportCompressedSize: true,
    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom"],
    exclude: ["date-fns", "libphonenumber-js"],
  },
});
