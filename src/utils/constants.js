require("dotenv").config();

const PORT = process.env.PORT;
const IP = process.env.IP;
const SESSION_NAME = process.env.SESSION_NAME;
const NODE_ENV = process.env.NODE_ENV;
const DOMAIN = process.env.NODE_ENV === "development" ? "localhost" : "projects-stage.ru";
const CERT_PATH = process.env.NODE_ENV === "development" ? "fake-keys" : "/etc/letsencrypt/live";
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;

module.exports = {
  PORT,
  IP,
  SESSION_NAME,
  NODE_ENV,
  DB_PORT,
  DOMAIN,
  CERT_PATH,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
};
