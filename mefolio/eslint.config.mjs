import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import babelParser from "@babel/eslint-parser";

export default defineConfig([
  {
    ignores: [".meteor/**", "**/.meteor/**", "_build/**", "**/_build/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js, react: pluginReact },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.browser,
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      // Count identifiers referenced in JSX as "used" so imported components
      // and icons aren't falsely flagged by no-unused-vars.
      "react/jsx-uses-vars": "error",
      // Allow intentionally-unused identifiers/args prefixed with "_".
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // Node/CommonJS config files use module/require/__dirname (restored from TECH-03).
  {
    files: ["postcss.config.js", "rspack.config.js", "tailwind.config.js"],
    languageOptions: { globals: globals.node },
  },
  // Test files use Mocha globals (describe/it) and the Meteor global (restored from TECH-03).
  {
    files: ["tests/**/*.{js,jsx}", "**/*.test.{js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.mocha,
        Meteor: "readonly",
      },
    },
  },
]);
