const express = require("express");
const confRouter = express.Router();
const confController = require("../controllers/conf.controller");

confRouter.get("/", confController.index);

confRouter.get("/create-conf", confController.createConf);

confRouter.get("/join-conf", confController.joinConf);

confRouter.get("/room", confController.room);

confRouter.get("/public-rooms", confController.publicRooms);

module.exports = confRouter;
