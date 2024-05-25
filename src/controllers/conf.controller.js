const createPath = require("../helpers/createPath.helper");
const path = require("path");

exports.index = (_req, res) => {
  res.render(createPath("index"), {
    props: {
      title: "Главная",
    },
  });
};

exports.createConf = (_req, res) => {
  res.render(createPath("open-broadcast"), {
    props: {
      title: "Создание видеоконференции",
    },
  });
};

exports.joinConf = (_req, res) => {
  res.render(createPath("join-broadcast"), {
    props: {
      title: "Подключение к видео конференции",
    },
  });
};

exports.publicRooms = (req, res) => {
  res.render(createPath("public-rooms"), {
    props: { title: "Открытые конференции", breadcrumbs: req.breadcrumbs },
    layout: path.join(__dirname, "../views/layouts/public-rooms-layout.ejs"),
  });
};

exports.room = (req, res) => {
  res.render(createPath("room"), {
    props: {
      title: req.params["room"],
      link: "https://" + req.hostname + "/" + req.params["room"],
    },
    layout: path.join(__dirname, "../views/layouts/room-layout.ejs"),
  });
};
