const express = require("express");
const homeRouter = express.Router();
const homeController = require("../controllers/home.controller");

homeRouter.get("/", homeController.index);

homeRouter.get("/create-conf", homeController.createConf);

module.exports = homeRouter;
