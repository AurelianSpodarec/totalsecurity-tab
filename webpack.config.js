
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
      filename: 'app/[name]/[name].min.css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "app/side_panel/index.html", to: "app/side_panel/index.html" },
        { from: "app/background/service-worker.js", to: "service-worker.js" },
        {
          from: "src/manifest.json",
          to: "manifest.json",
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
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /\.(test|testing)\.ts$/,
        use: [ { loader: "ts-loader" } ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader"
        ]
      },
      {
        test: /\.(svg)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 8192
          }
        }
      }
    ]
  },
  entry: {
    background: "./app/background/background.ts",
    side_panel: "./app/side_panel/side_panel.tsx"
  },
  output: {
    filename: "app/[name]/[name].min.js",
    path: buildDir
  },
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
      chunks: 'initial',
      minSize: 0,
      minChunks: 1,
      cacheGroups: {
        default: false,
        defaultVendors: false,
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 20,
          minChunks: 1,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 10,
          minChunks: 1,
        },
        shared: {
          test: /[\\/]src[\\/]/,
          name: 'shared',
          minChunks: 2,
          priority: 0,
        },
      },
    },
  }
};
