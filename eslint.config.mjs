// eslint.config.mjs
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

// <-- note: imported object

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      tsPlugin,
      reactPlugin,
      "react-hooks": reactHooksPlugin, // <-- the key must match the rule prefix
    },
    rules: {
      // TypeScript rules
      "tsPlugin/no-unused-vars": "error",

      // React rules
      "react/display-name": "off",
      "react/jsx-uses-react": "off",

      // Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
