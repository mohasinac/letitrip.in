const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const googleConfig = require("eslint-config-google");

module.exports = [
  {
    ignores: [
      "lib/**/*",
      "generated/**/*",
      "node_modules/**/*",
      "*.config.js",
      ".eslintrc.js",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        process: "readonly",
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        Buffer: "readonly",
      },
    },
    rules: {
      ...googleConfig.rules,
      quotes: ["error", "double"],
      indent: ["error", 2],
      "max-len": [
        "error",
        { code: 120, ignoreTemplateLiterals: true, ignoreStrings: true },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "require-jsdoc": "off",
      "valid-jsdoc": "off",
      "new-cap": "off",
      "linebreak-style": "off", // Allow CRLF on Windows
      "comma-dangle": ["error", "always-multiline"],
    },
  },
];
