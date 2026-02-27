const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (_, argv) => {
  const isProduction = argv.mode === "production";

  return {
    mode: isProduction ? "production" : "development",
    entry: {
      app: path.resolve(__dirname, "scripts/app.js"),
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProduction ? "js/[name].[contenthash].js" : "js/[name].js",
      assetModuleFilename: "assets/[name][ext][query]",
      clean: true,
    },
    devtool: isProduction ? "source-map" : "eval-cheap-module-source-map",
    cache: {
      type: "filesystem",
      cacheDirectory: path.resolve(__dirname, ".webpack-cache"),
      buildDependencies: {
        config: [__filename],
      },
    },
    devServer: {
      static: {
        directory: path.resolve(__dirname),
      },
      hot: true,
      compress: true,
      historyApiFallback: true,
      port: 9000,
      open: false,
      client: {
        overlay: true,
      },
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|jpe?g|gif|svg|webp|avif|ico)$/i,
          type: "asset/resource",
        },
        {
          test: /\.(woff2?|eot|ttf|otf)$/i,
          type: "asset/resource",
        },
      ],
    },
    resolve: {
      extensions: [".js", ".json"],
      alias: {
        "@scripts": path.resolve(__dirname, "scripts"),
        "@styles": path.resolve(__dirname, "styles"),
        "@data": path.resolve(__dirname, "data"),
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "index.html"),
        filename: "index.html",
        inject: "body",
        scriptLoading: "defer",
      }),
    ],
    optimization: {
      splitChunks: {
        chunks: "all",
      },
      runtimeChunk: "single",
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              drop_console: false,
            },
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
      ],
    },
    performance: {
      hints: isProduction ? "warning" : false,
    },
  };
};
