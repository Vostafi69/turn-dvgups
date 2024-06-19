const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const config = {
  mode: "production",
  entry: {
    broadcast: "./src/public/js/broadcast.js",
    "open-broadcast": "./src/public/js/openBroadcast.js",
    "join-broadcast": "./src/public/js/joinBroadcast.js",
    prerender: "./src/public/js/prerender.js",
    "public-rooms": "./src/public/js/publicRooms.js",
    ui: "./src/public/js/ui.js",
    auth: "./src/public/js/auth.js",
  },
  output: {
    filename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new NodePolyfillPlugin({
      excludeAliases: ["async_hooks"],
    }),
  ],
};

module.exports = config;
