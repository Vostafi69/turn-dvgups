const createPath = require("../helpers/createPath.helper");

exports.index = (_req, res) => {
  res.render(createPath("index"), {
    title: "Главная",
  });
};

exports.createConf = (_req, res) => {
  res.render(createPath("create-conf"), {
    title: "Создание конференции",
  });
};
