const createPath = require("../helpers/createPath.helper");
const path = require("path");

exports.login = (_req, res) => {
  res.render(createPath("login"), {
    props: { title: "Авторизация" },
    layout: path.join(__dirname, "../views/layouts/auth-layout.ejs"),
  });
};
