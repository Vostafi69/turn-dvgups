const express = require("express");
const app = express();
const path = require("path");
const homeRouter = require("../routes/home.router");

app.use("/public", express.static(path.join(__dirname, "../../dev")));

app.use("/", homeRouter);

app.use((_, res) => {
  res.status(404).send("Not Found");
});

module.exports = app;
