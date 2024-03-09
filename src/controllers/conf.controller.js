const createPath = require("../helpers/createPath.helper");
const path = require("path");

exports.index = (req, res) => {
  res.render(createPath("index"), {
    props: {
      title: "Главная",
      breadcrumbs: req.breadcrumbs,
    },
  });
};

exports.createConf = (req, res) => {
  res.render(createPath("create-conf"), {
    props: {
      title: "Создание конференции",
      breadcrumbs: req.breadcrumbs,
    },
  });
};

exports.joinConf = (req, res) => {
  res.render(createPath("join-conf"), {
    props: {
      title: "Создание конференции",
      breadcrumbs: req.breadcrumbs,
    },
  });
};

exports.room = (_req, res) => {
  res.render(createPath("room"), {
    props: {
      title: "Создание конференции",
    },
    layout: path.join(__dirname, "../views/layouts/room-layout"),
  });
};
