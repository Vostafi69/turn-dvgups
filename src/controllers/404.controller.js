const createPath = require("../helpers/createPath.helper");
const path = require("path");

exports.notFound = (_req, res) => {
  res.render(createPath("404"), {
    props: {
      title: "404",
    },
    layout: path.join(__dirname, "../views/layouts/404-layout.ejs"),
  });
};
