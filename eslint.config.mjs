import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "react/display-name": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
      "prefer-const": "warn",
      "no-var": "error",
      "no-console": [
        "warn",
        {
          allow: ["warn", "error", "info"],
        },
      ],
      // Doc 30: Prevent usage of deprecated components
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/components/ui/Input", "**/components/ui/Select"],
              message:
                "Use FormInput/FormSelect from @/components/forms instead (Doc 27 standard)",
            },
            {
              group: [
                "**/components/mobile/MobileFormInput",
                "**/components/mobile/MobileFormSelect",
                "**/components/mobile/MobileTextarea",
              ],
              message:
                "Use FormInput/FormSelect/FormTextarea from @/components/forms instead (Doc 27 standard)",
            },
          ],
        },
      ],
      // Doc 29: Warn on raw img tags (use OptimizedImage)
      "no-restricted-syntax": [
        "warn",
        {
          selector: 'JSXOpeningElement[name.name="img"]',
          message:
            "Use OptimizedImage from @/components/common/OptimizedImage instead of raw <img> tag (Doc 29)",
        },
      ],
    },
  },
];

export default eslintConfig;
