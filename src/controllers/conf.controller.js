const createPath = require("../helpers/createPath.helper");

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
