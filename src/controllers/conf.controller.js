const createPath = require("../helpers/createPath.helper");
const path = require("path");

exports.index = (req, res) => {
  const { userId } = req.session;
  console.log(userId);

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

exports.publicRooms = (_req, res) => {
  res.render(createPath("public-rooms"), {
    props: { title: "Открытые конференции" },
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
