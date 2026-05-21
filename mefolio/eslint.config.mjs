import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: [".meteor/**", "**/.meteor/**", "_build/**", "**/_build/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["postcss.config.js", "rspack.config.js", "tailwind.config.js"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["tests/**/*.{js,jsx}", "**/*.test.{js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.mocha,
        Meteor: "readonly",
      },
    },
  },
  pluginReact.configs.flat.recommended,
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  prettier,
];
