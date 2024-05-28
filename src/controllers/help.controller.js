const createPath = require("../helpers/createPath.helper");
const path = require("path");

exports.index = (_req, res) => {
  res.render(createPath("help"), {
    props: { title: "Помощь" },
    layout: path.join(__dirname, "../views/layouts/help-layout.ejs"),
  });
};
