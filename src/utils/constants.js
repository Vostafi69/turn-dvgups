require("dotenv").config();

const PORT = process.env.PORT;
const IP = process.env.IP;
const NODE_ENV = process.env.NODE_ENV;
const DOMAIN = process.env.NODE_ENV === "development" ? "localhost" : "projects-stage.ru";
const CERT_PATH = process.env.NODE_ENV === "development" ? "fake-keys" : "/etc/letsencrypt/live";

module.exports = { PORT, IP, NODE_ENV, DOMAIN, CERT_PATH };
