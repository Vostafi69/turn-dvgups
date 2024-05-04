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

exports.room = (req, res) => {
  res.render(createPath("room"), {
    props: { title: req.params["id"] },
    layout: path.join(__dirname, "../views/layouts/room-layout.ejs"),
  });
};

exports.publicRooms = (req, res) => {
  res.render(createPath("public-rooms"), {
    props: { title: "Открытые конференции", breadcrumbs: req.breadcrumbs },
    layout: path.join(__dirname, "../views/layouts/public-rooms-layout.ejs"),
  });
};
