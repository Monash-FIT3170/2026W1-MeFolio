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
  pluginReact.configs.flat.recommended,
  {
    rules: {
      "react/react-in-jsx-scope": "off",
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
