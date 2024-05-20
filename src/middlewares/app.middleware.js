const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const path = require("path");
const confRouter = require("../routes/conf.router");
const { NODE_ENV } = require("../utils/constants");

const public = NODE_ENV === "development" ? "dev" : "dist";

// engine
app.set("view engine", "ejs");
app.use(expressLayouts);

// static
app.set("layout", path.join(__dirname, "../views/layouts/layout.ejs"));
app.use("*/public", express.static(path.join(__dirname, `../../${public}`)));
app.use("*/img", express.static(path.join(__dirname, `../../${public}/img`)));
app.use("*/js", express.static(path.join(__dirname, `../../${public}/js`)));
app.use("*/libs", express.static(path.join(__dirname, `../../${public}/libs`)));

// routes
app.use("/", confRouter);

app.use((_req, res) => {
  res.status(404).send("Not Found");
});

module.exports = app;
