
import webpack from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";
import path from "node:path"
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
const __dirname = new URL(".", import.meta.url).pathname;
const buildDir = `${__dirname}/build`;
const ENV = process.env.ENV;
const isProd = ENV !== "dev";

export default {
  target: "web",
  devtool: isProd ? false : "inline-source-map",
  plugins: [
    // new BundleAnalyzerPlugin({ defaultSizes: "stat" }),
    new webpack.ProgressPlugin(),
    new MiniCssExtractPlugin({
      filename: 'app/[name]/[name].min.css', // Output file with cache-busting hash
    }),
    new CopyWebpackPlugin({
      patterns: [
        // Copy side panel app index.html file
        { from: "app/side_panel/index.html", to: "app/side_panel/index.html" },
        // Copy service worker entry file
        { from: "app/background/service-worker.js", to: "service-worker.js" },
        // Copy manifest.json file
        {
          from: "src/manifest.json",
          to: "manifest.json",
          // Replace any values or placeholders in the manifest.json file
          transform: (content) => {
            const manifest = JSON.parse(content.toString());
            manifest.version = "1.0"; // TODO: Pull version dynamically from env variable or package.json
            return JSON.stringify(manifest, null, 2);
          }
        }
      ]
    })
  ],
  mode: isProd ? "production" : "development",
  resolve: {
    extensions: [ ".ts", ".tsx", ".js", ".json" ],
    plugins: [
      new TsconfigPathsPlugin()
    ]
  },
  // Loaders
  module: {
    rules: [
      // TypeScript
      {
        test: /\.(ts|tsx)$/,
        exclude: /\.(test|testing)\.ts$/,
        use: [ { loader: "ts-loader" } ]
      },
      // CSS
      {
        test: /\.css$/, // Matches any .css file
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader"
        ]
      },
      // Images
      {
        test: /\.(svg)$/,
        type: "asset", // Automatically decides between 'asset/resource' and 'asset/inline' based on file size
        parser: {
          dataUrlCondition: {
            maxSize: 8192 // Inline files smaller than 8kb as Data URLs, emit others as separate files
          }
        }
      }
    ]
  },
  // Entry
  entry: {
    background: "./app/background/background.ts",
    side_panel: "./app/side_panel/side_panel.tsx"
  },
  // Output
  output: {
    filename: "app/[name]/[name].min.js",
    path: buildDir
  },
  // Optimization
  optimization: {
    concatenateModules: false,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: { unused: true, dead_code: true },
        },
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      }),
    ],
    splitChunks: {
      chunks: 'initial', // Only initial chunks
      minSize: 0, // Allow small chunks (no minimum)
      minChunks: 1, // Override defaults for full control
      cacheGroups: {
        // Disable default groups
        default: false,
        defaultVendors: false,
        // Custom groups
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react', // chunks/react.js
          priority: 20, // Highest priority to catch React first
          minChunks: 1, // Include even if used in one entry
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor', // chunks/vendors.js
          priority: 10, // Lower than react to exclude it
          minChunks: 1,
        },
        shared: {
          test: /[\\/]src[\\/]/, // Only your app code
          name: 'shared', // chunks/common.js
          minChunks: 2, // Shared across 2+ entries
          priority: 0, // Lowest priority
        },
      },
    },
  }
};
