const createPath = require("../helpers/createPath.helper");
const userService = require("../services/user.service");
const path = require("path");

exports.index = async (req, res) => {
  const userRole = await userService.getRole(req.session.userId);

  res.render(createPath("index"), {
    props: {
      title: "Главная",
      role: userRole,
    },
  });
};

exports.createConf = async (req, res) => {
  const userRole = await userService.getRole(req.session.userId);

  if (userRole !== "student") {
    res.render(createPath("open-broadcast"), {
      props: {
        title: "Создание видеоконференции",
      },
    });
  } else {
    res.redirect("/");
  }
};

exports.joinConf = (_req, res) => {
  res.render(createPath("join-broadcast"), {
    props: {
      title: "Подключение к видео конференции",
    },
  });
};

exports.publicRooms = (_req, res) => {
  return res.redirect("/");

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
