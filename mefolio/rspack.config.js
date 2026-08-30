const { defineConfig } = require("@meteorjs/rspack");

/**
 * Rspack configuration for Meteor projects.
 *
 * Provides typed flags on the `Meteor` object, such as:
 * - `Meteor.isClient` / `Meteor.isServer`
 * - `Meteor.isDevelopment` / `Meteor.isProduction`
 * - and other flags available
 *
 * Use these flags to adjust your build settings based on environment.
 */
module.exports = defineConfig((_Meteor) => {
  return {
    ignoreWarnings: [
      /Critical dependency: the request of a dependency is an expression/,
    ],
    module: {
      rules: [
        // Add support for importing SVGs as React components
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: ["@svgr/webpack"],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: ["@tailwindcss/postcss", "autoprefixer"],
                },
              },
            },
          ],
          type: "css",
        },
      ],
    },
  };
});
