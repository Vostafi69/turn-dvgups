const express = require("express");
const jsonParser = express.json();
const confRouter = express.Router();
const confController = require("../controllers/conf.controller");
const helpController = require("../controllers/help.controller");
const authController = require("../controllers/auth.controller");
const notFoundController = require("../controllers/404.controller");
const authService = require("../services/auth.service");
const conferenceService = require("../services/conference.service");
const { redirectHome, redirectLogin } = require("../middlewares/redirect.middleware");

confRouter.get("/", redirectLogin, confController.index);

confRouter.get("/login", redirectHome, authController.login);

confRouter.post("/login", jsonParser, authService.login);

confRouter.post("/logout", jsonParser, authService.logout);

confRouter.get("/open", redirectLogin, confController.createConf);

confRouter.get("/join", redirectLogin, confController.joinConf);

confRouter.get("/help", redirectLogin, helpController.index);

confRouter.get("/public-rooms", confController.publicRooms);

confRouter.get("/:room", redirectLogin, confController.room);

confRouter.post("/blockUser", jsonParser, conferenceService.blockUser);

confRouter.post("/checkUserIsBlocked", jsonParser, conferenceService.checkUserIsBlocked);

confRouter.get("*", notFoundController.notFound);

module.exports = confRouter;
