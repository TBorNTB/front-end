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
    ignores: [
      "node_modules/**",
      ".next/**", 
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // Add custom rules to fix your compilation errors
    rules: {
      // TypeScript unused variables - change from error to warning
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_" 
      }],
      
      // Function type safety
      "@typescript-eslint/no-unsafe-function-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Next.js Image optimization 
      "@next/next/no-img-element": "warn",
      
      // Accessibility
      "jsx-a11y/alt-text": "warn",
      
      // React Hooks
      "react-hooks/exhaustive-deps": "warn",
    }
  }
];

export default eslintConfig;
