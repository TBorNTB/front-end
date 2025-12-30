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
    // Combined custom rules to fix compilation errors and improve code quality
    rules: {
      // ✅ TypeScript unused variables - unified pattern
      "@typescript-eslint/no-unused-vars": [
        "error", 
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      
      // ✅ Function type safety
      "@typescript-eslint/no-unsafe-function-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "error", // Added for empty interface fix
      
      // ✅ React and Next.js rules
      "react/no-unescaped-entities": "warn", // Added from your request
      "@next/next/no-img-element": "warn",
      
      // ✅ Accessibility
      "jsx-a11y/alt-text": "warn",
      
      // ✅ React Hooks
      "react-hooks/exhaustive-deps": "warn",
      
      // ✅ General code quality
      "prefer-const": "error", // Fix for let -> const issues
    }
  }
];

export default eslintConfig;
