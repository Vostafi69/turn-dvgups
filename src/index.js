const appMiddleware = require("./middlewares/app.middleware");
const https = require("https");
const ioServer = require("socket.io");
const fs = require("fs");

const { PORT, IP } = require("./utils/constants");

const {
  BASH_COLORS_HELPER,
  getValuesFromConfigJson,
  getBashParameters,
  beforeHttpListen,
  afterHttpListen,
  addSocket,
} = require("rtcmulticonnection-server");

let config = getValuesFromConfigJson({
  config: "config.json",
  logs: "logs.json",
});
config = getBashParameters(config, BASH_COLORS_HELPER);

const options = {
  key: fs.readFileSync("fake-keys/privatekey.pem"),
  cert: fs.readFileSync("fake-keys/certificate.pem"),
};

// create server
const server = https.createServer(options, appMiddleware);

// open sockets
ioServer(server).on("connection", (socket) => {
  addSocket(socket, config);
});

// run server
beforeHttpListen(server, config);
server.listen(PORT, IP, () => {
  afterHttpListen(server, config);
});
