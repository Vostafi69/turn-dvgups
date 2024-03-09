const config = {
  mode: "production",
  entry: {
    index: "./src/public/js/index.js",
    prerender: "./src/public/js/prerender.js",
    main: "./src/public/js/main.js",
  },
  output: {
    filename: "[name].bundle.js",
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
    ],
  },
};

module.exports = config;
