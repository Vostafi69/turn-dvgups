const { Pool } = require("pg");
const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = require("../utils/constants");

const client = new Pool({
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
});

// client.connect().catch((error) => console.log(error));

module.exports = client;
