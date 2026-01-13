import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { copyFileSync, mkdirSync, readdirSync } from "fs";

// Plugin to copy CSS token files to dist
function copyTokens() {
  return {
    name: 'copy-tokens',
    closeBundle() {
      const tokensDir = resolve(__dirname, 'src/styles/tokens');
      const distTokensDir = resolve(__dirname, 'dist/styles/tokens');
      
      // Create dist/styles/tokens directory
      mkdirSync(distTokensDir, { recursive: true });
      
      // Copy all CSS files
      const files = readdirSync(tokensDir);
      files.forEach(file => {
        if (file.endsWith('.css')) {
          copyFileSync(
            resolve(tokensDir, file),
            resolve(distTokensDir, file)
          );
        }
      });
      
      console.log(`✓ Copied ${files.filter(f => f.endsWith('.css')).length} CSS token files to dist/styles/tokens`);
    }
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
      },
      name: "LetitripReactLibrary",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
