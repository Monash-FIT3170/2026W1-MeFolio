import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import babelParser from "@babel/eslint-parser";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,jsx}"], 
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
      "react/react-in-jsx-scope": "off"
    },
  },
]);
