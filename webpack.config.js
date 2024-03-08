const config = {
  mode: "production",
  entry: {
    index: "./src/public/js/index.js",
    prerender: "./src/public/js/prerender.js",
    // about: './src/js/about.js',
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
