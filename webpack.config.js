const config = {
  mode: "production",
  entry: {
    index: "./src/public/js/index.js",
    prerender: "./src/public/js/prerender.js",
    rooms: "./src/public/js/rtc/public-rooms.js",
    ui: "./src/public/js/ui.js",
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
};

module.exports = config;
