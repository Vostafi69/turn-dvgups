const express = require("express");
const app = express();
const path = require("path");
const homeRouter = require("../routes/home.router");
const { NODE_ENV } = require("../utils/constants");

const public = NODE_ENV === "development" ? "dev" : "build";

app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, `../../${public}`)));
app.use("/img", express.static(path.join(__dirname, `../../${public}/img`)));
app.use("/js", express.static(path.join(__dirname, `../../${public}/js`)));
app.use("/", homeRouter);
app.use((_req, res) => {
  res.status(404).send("Not Found");
});

module.exports = app;
