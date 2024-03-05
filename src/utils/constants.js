require("dotenv").config();

const PORT = process.env.PORT;
const IP = process.env.IP;
const NODE_ENV = process.env.NODE_ENV;

module.exports = { PORT, IP, NODE_ENV };
