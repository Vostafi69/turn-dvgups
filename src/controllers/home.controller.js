const path = require("path");

exports.index = (_, res) => {
  res.sendFile(path.join(__dirname, "../views/index.html"));
};
