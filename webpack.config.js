const config = {
  mode: "production",
  entry: {
    open: "./src/public/js/rtc/open-room.js",
    join: "./src/public/js/rtc/join-room.js",
    room: "./src/public/js/rtc/room.js",
    broadcast: "./src/public/js/rtc/broadcast.js",
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
