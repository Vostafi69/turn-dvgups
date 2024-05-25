const express = require("express");
const confRouter = express.Router();
const confController = require("../controllers/conf.controller");

confRouter.get("/", confController.index);

confRouter.get("/open", confController.createConf);

confRouter.get("/join", confController.joinConf);

confRouter.get("/public-rooms", confController.publicRooms);

confRouter.get("/:room", confController.room);

module.exports = confRouter;
