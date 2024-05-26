const appMiddleware = require("./middlewares/app.middleware");
const https = require("https");
const ioServer = require("socket.io");
const fs = require("fs");
const { PORT, IP, CERT_PATH, DOMAIN } = require("./utils/constants");

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
  key: fs.readFileSync(`${CERT_PATH}/${DOMAIN}/privkey.pem`),
  cert: fs.readFileSync(`${CERT_PATH}/${DOMAIN}/fullchain.pem`),
};

// create server
const server = https.createServer(options, appMiddleware);

// run server
beforeHttpListen(server, config);
const httpsServer = server.listen(PORT, IP, () => {
  afterHttpListen(server, config);
});

// open sockets
ioServer(httpsServer).on("connection", (socket) => {
  addSocket(socket, config);

  const params = socket.handshake.query;

  if (!params.socketCustomEvent) {
    params.socketCustomEvent = "custom-message";
  }

  socket.on(params.socketCustomEvent, function (message) {
    socket.broadcast.emit(params.socketCustomEvent, message);
  });
});
