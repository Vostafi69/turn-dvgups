// import connection from "./connection";
var connection = new RTCMultiConnection();

connection.iceServers = [
  {
    urls: [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
      "stun:stun2.l.google.com:19302",
      "stun:stun.l.google.com:19302?transport=udp",
    ],
  },
];

connection.enableScalableBroadcast = true;
connection.maxRelayLimitPerUser = 1;
connection.autoCloseEntireSession = true;
connection.socketURL = "/";
connection.socketMessageEvent = "scalable-media-broadcast-demo";

function initBroadcast() {
  const broadcastId = window.location.pathname.slice(1);
  const params = new URLSearchParams(document.location.search);
  const event = params.get("event");

  window.history.pushState(null, "", window.location.pathname);

  connection.connectSocket((socket) => {
    if (event === "open") {
      openBroadcast(socket, broadcastId);
      return;
    }

    if (event === "join") {
      joinBroadcast(socket, broadcastId);
      return;
    }

    window.location.replace("/join");
  });
}

connection.onstream = function (event) {
  if (connection.isInitiator && event.type !== "local") {
    return;
  }

  connection.isUpperUserLeft = false;

  if (connection.isInitiator == false && event.type === "remote") {
    connection.dontCaptureUserMedia = true;
    connection.attachStreams = [event.stream];
    connection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: false,
      OfferToReceiveVideo: false,
    };

    connection.getSocket((socket) => {
      socket.emit("can-relay-broadcast");
    });
  }
};

function openBroadcast(socket, broadcastId) {
  connection.extra.broadcastId = broadcastId;

  connection.session = {
    audio: true,
    video: true,
    oneway: true,
  };

  socket.emit("check-broadcast-presence", broadcastId, (isBroadcastExists) => {
    if (!isBroadcastExists) {
      connection.userid = broadcastId;
    }

    console.log("check-broadcast-presence", broadcastId, isBroadcastExists);
  });

  socket.emit("join-broadcast", {
    broadcastId: broadcastId,
    userid: connection.userid,
    typeOfStreams: connection.session,
  });

  socket.on("start-broadcasting", (typeOfStreams) => {
    console.log("start-broadcasting", typeOfStreams);

    connection.sdpConstraints.mandatory = {
      OfferToReceiveVideo: false,
      OfferToReceiveAudio: false,
    };

    connection.session = typeOfStreams;

    connection.open(broadcastId);
  });
}

function joinBroadcast(socket, broadcastId) {
  socket.on("join-broadcaster", (hintsToJoinBroadcast) => {
    console.log("join-broadcaster", hintsToJoinBroadcast);

    connection.session = hintsToJoinBroadcast.typeOfStreams;
    connection.sdpConstraints.mandatory = {
      OfferToReceiveVideo: !!connection.session.video,
      OfferToReceiveAudio: !!connection.session.audio,
    };

    connection.join(broadcastId);
  });
}

function stopBroadcast(socket) {
  socket.on("broadcast-stopped", (broadcastId) => {
    console.error("broadcast-stopped", broadcastId);
  });
}

initBroadcast();
